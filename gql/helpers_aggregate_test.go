package gql

import (
	"context"
	"io"
	"log/slog"
	"testing"
	"time"

	"beavermoney.app/ent/account"
	"beavermoney.app/ent/enttest"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/ent/userhousehold"
	"beavermoney.app/gql/model"
	"beavermoney.app/internal/contextkeys"

	"github.com/shopspring/decimal"
	"go.opentelemetry.io/otel/trace/noop"

	_ "github.com/mattn/go-sqlite3"
)

// TestAggregateByCategoryType_MultiEntryExpenseScopedByUser pins the entry-level
// filter behavior of applyViewUserIDEntryFilter. Pre-fix, scoping by viewUserID
// over-summed because all sibling entries (including those on other users'
// accounts) were aggregated. Post-fix, each scope sees only its own slice and
// multi-id selections sum slices across the chosen owners.
//
// Setup: one household, two users (A, B). One $100 expense from A's account,
// one $5 fee on B's account, both attached to the same transaction. Expected
// expense totals (Abs):
//
//	[]    -> 105 (combined view, all entries)
//	[A]   -> 100 (only A's main entry)
//	[B]   ->   5 (only B's fee entry)
//	[A,B] -> 105 (both slices added)
func TestAggregateByCategoryType_MultiEntryExpenseScopedByUser(t *testing.T) {
	client := enttest.Open(
		t,
		"sqlite3",
		"file:helpers_aggregate?mode=memory&cache=shared&_fk=1",
	)
	t.Cleanup(func() { _ = client.Close() })

	bypass := contextkeys.NewPrivacyBypassContext(context.Background())

	userA := client.User.Create().
		SetEmail("a@bm.test").SetName("A").SaveX(bypass)
	userB := client.User.Create().
		SetEmail("b@bm.test").SetName("B").SaveX(bypass)

	hh := client.Household.Create().
		SetName("Test").SetLocale("en-US").SaveX(bypass)
	hctx := context.WithValue(bypass, contextkeys.HouseholdIDKey(), hh.ID)

	usd := client.HouseholdCurrency.Create().
		SetHouseholdID(hh.ID).SetCode("USD").SetImportant(true).SaveX(hctx)

	client.UserHousehold.Create().
		SetUserID(userA.ID).SetHouseholdID(hh.ID).
		SetRole(userhousehold.RoleAdmin).
		SetHouseholdCurrencyID(usd.ID).SaveX(bypass)
	client.UserHousehold.Create().
		SetUserID(userB.ID).SetHouseholdID(hh.ID).
		SetRole(userhousehold.RoleMember).
		SetHouseholdCurrencyID(usd.ID).SaveX(bypass)

	accA := client.Account.Create().
		SetName("A's Checking").
		SetType(account.TypeLiquidity).
		SetUserID(userA.ID).
		SetHouseholdID(hh.ID).
		SetHouseholdCurrencyID(usd.ID).
		SaveX(hctx)
	accB := client.Account.Create().
		SetName("B's Checking").
		SetType(account.TypeLiquidity).
		SetUserID(userB.ID).
		SetHouseholdID(hh.ID).
		SetHouseholdCurrencyID(usd.ID).
		SaveX(hctx)

	expenseCat := client.TransactionCategory.Create().
		SetName("Groceries").
		SetType(transactioncategory.TypeExpense).
		SetIcon("cart").
		SetHouseholdID(hh.ID).
		SaveX(hctx)

	txnTime, err := time.Parse(time.RFC3339, "2026-01-15T12:00:00Z")
	if err != nil {
		t.Fatalf("parse txn time: %v", err)
	}
	txn := client.Transaction.Create().
		SetHouseholdID(hh.ID).
		SetUserID(userA.ID).
		SetCategoryID(expenseCat.ID).
		SetDatetime(txnTime).
		SetDescription("Multi-user grocery run").
		SaveX(hctx)

	client.TransactionEntry.Create().
		SetHouseholdID(hh.ID).
		SetTransactionID(txn.ID).
		SetAccountID(accA.ID).
		SetHouseholdCurrencyID(usd.ID).
		SetAmount(decimal.NewFromInt(-100)).
		SaveX(hctx)
	client.TransactionEntry.Create().
		SetHouseholdID(hh.ID).
		SetTransactionID(txn.ID).
		SetAccountID(accB.ID).
		SetHouseholdCurrencyID(usd.ID).
		SetAmount(decimal.NewFromInt(-5)).
		SaveX(hctx)

	r := &Resolver{
		logger:    slog.New(slog.NewTextHandler(io.Discard, nil)),
		entClient: client,
		tracer:    noop.NewTracerProvider().Tracer("test"),
	}
	fr := &householdResolver{r}

	queryCtx := context.WithValue(
		bypass,
		contextkeys.HouseholdIDKey(),
		hh.ID,
	)
	queryCtx = context.WithValue(
		queryCtx,
		contextkeys.DisplayCurrencyKey(),
		&contextkeys.DisplayCurrency{HouseholdCurrencyID: usd.ID, Code: "USD"},
	)

	cases := []struct {
		name         string
		viewUserIDs  []int
		wantTotal    string
		wantTxnCount int
	}{
		{"combined (nil)", nil, "105", 1},
		{"combined (empty slice)", []int{}, "105", 1},
		{"scoped to user A", []int{userA.ID}, "100", 1},
		{"scoped to user B", []int{userB.ID}, "5", 1},
		{"scoped to A and B", []int{userA.ID, userB.ID}, "105", 1},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			out, err := fr.aggregateByCategoryType(
				queryCtx,
				&model.FinancialReport{},
				transactioncategory.TypeExpense,
				tc.viewUserIDs,
			)
			if err != nil {
				t.Fatalf("aggregateByCategoryType: %v", err)
			}

			gotTotal, err := decimal.NewFromString(out.Total)
			if err != nil {
				t.Fatalf("parse total %q: %v", out.Total, err)
			}
			wantTotal, _ := decimal.NewFromString(tc.wantTotal)
			if !gotTotal.Equal(wantTotal) {
				t.Errorf(
					"total = %s, want %s",
					gotTotal.String(),
					wantTotal.String(),
				)
			}

			if out.TransactionCount != tc.wantTxnCount {
				t.Errorf(
					"transactionCount = %d, want %d",
					out.TransactionCount,
					tc.wantTxnCount,
				)
			}
		})
	}
}
