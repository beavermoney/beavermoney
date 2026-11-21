package gql

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/snapshotrate"
	"beavermoney.app/internal/frankfurter"
	"github.com/shopspring/decimal"
)

func TestSnapshotCurrencyBackfillRepairsPartialPairsWithoutReplacingSavedFX(t *testing.T) {
	f := setupMemberFixture(t)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	c := f.client
	cad := c.HouseholdCurrency.Create().SetHouseholdID(f.household.ID).SetCode("CAD").SetImportant(false).SaveX(ctx)
	eur := c.HouseholdCurrency.Create().SetHouseholdID(f.household.ID).SetCode("EUR").SetImportant(true).SaveX(ctx)
	at := time.Date(2020, 1, 2, 12, 0, 0, 0, time.UTC)
	s := c.Snapshot.Create().SetHouseholdID(f.household.ID).SetFormatVersion(1).SetCreateTime(at).SaveX(ctx)
	preserved := c.SnapshotRate.Create().SetHouseholdID(f.household.ID).SetSnapshotID(s.ID).SetFromCurrencyID(eur.ID).SetToCurrencyID(f.primaryCurrency.ID).SetRate(decimal.RequireFromString("1.111111")).SetCreateTime(at).SetUpdateTime(at).SaveX(ctx)
	var calls atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		call := calls.Add(1)
		q := r.URL.Query()
		if q.Get("date") != "2020-01-02" || q.Get("base") != "EUR" || !strings.Contains(q.Get("quotes"), "CAD") {
			t.Errorf("wrong historical request: %s", r.URL)
		}
		rates := []map[string]any{{"date": "2020-01-02", "base": "EUR", "quote": "USD", "rate": 1.2}}
		if call > 1 {
			rates = append(rates, map[string]any{"date": "2020-01-02", "base": "EUR", "quote": "CAD", "rate": 1.5})
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(rates)
	}))
	defer server.Close()
	fx, err := frankfurter.NewClientWithResponses(server.URL)
	if err != nil {
		t.Fatal(err)
	}
	resolver := newMemberTestResolver(c)
	resolver.frankfurterClient = fx
	mr := &mutationResolver{Resolver: resolver}
	for range 3 {
		if err := mr.backfillSnapshotRatesForCurrency(ctx, c, f.household.ID, eur, []*ent.HouseholdCurrency{f.primaryCurrency, cad}); err != nil {
			t.Fatal(err)
		}
	}
	if calls.Load() != 2 {
		t.Fatalf("partial matrix was not retried or completed matrix refetched: %d calls", calls.Load())
	}
	rows := c.SnapshotRate.Query().Where(snapshotrate.SnapshotIDEQ(s.ID)).AllX(ctx)
	if len(rows) != 4 {
		t.Fatalf("missing directed pairs: %d", len(rows))
	}
	for _, r := range rows {
		if !r.CreateTime.Equal(at) || !r.UpdateTime.Equal(at) {
			t.Fatal("historical FX has an insertion timestamp instead of capture time")
		}
		if r.ID == preserved.ID && !r.Rate.Equal(preserved.Rate) {
			t.Fatal("existing frozen FX overwritten")
		}
	}
}

func TestRefreshUpdatesFXWithoutInvestmentHoldings(t *testing.T) {
	f := setupMemberFixture(t)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	f.client.HouseholdCurrency.Create().SetHouseholdID(f.household.ID).SetCode("CAD").SaveX(ctx)
	var calls atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		base, quote := r.URL.Query().Get("base"), r.URL.Query().Get("quotes")
		rate := 1.25
		if base == "CAD" {
			rate = 0.8
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode([]map[string]any{{"date": "2026-11-21", "base": base, "quote": quote, "rate": rate}})
	}))
	defer server.Close()
	fx, err := frankfurter.NewClientWithResponses(server.URL)
	if err != nil {
		t.Fatal(err)
	}
	resolver := newMemberTestResolver(f.client)
	resolver.frankfurterClient = fx
	mr := &mutationResolver{Resolver: resolver}
	if ok, err := mr.Refresh(ctx); err != nil || !ok {
		t.Fatalf("refresh failed: %v", err)
	}
	if calls.Load() != 2 || f.client.HouseholdRate.Query().CountX(ctx) != 2 {
		t.Fatal("cash-only household did not refresh all directed FX pairs")
	}
}
