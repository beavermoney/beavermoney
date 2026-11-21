package gql

import (
	"context"
	"encoding/json"
	"net/http/httptest"
	"os"
	"reflect"
	"strings"
	"testing"

	"beavermoney.app/cmd/server/database"
	"beavermoney.app/ent"
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/investment"
	"beavermoney.app/ent/snapshot"
	"beavermoney.app/ent/snapshotaccount"
	"beavermoney.app/ent/snapshotentry"
	"beavermoney.app/ent/snapshotinvestment"
	"beavermoney.app/ent/snapshotrate"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/gql/model"
	"beavermoney.app/internal/contextkeys"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/shopspring/decimal"
	"time"
)

// Runs against the isolated, migrated compatibility fixture. Every mutation is
// rolled back; production databases are explicitly rejected.
func TestReviewPostgresCompatibility(t *testing.T) {
	dsn := os.Getenv("REVIEW_TEST_DATABASE_URL")
	if dsn == "" {
		if os.Getenv("CI") == "true" {
			t.Fatal("CI must configure REVIEW_TEST_DATABASE_URL and prepare the PostgreSQL compatibility fixture")
		}
		t.Skip("set REVIEW_TEST_DATABASE_URL to the isolated compatibility fixture")
	}
	client, db, err := database.Connect(dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = client.Close() }()
	var name string
	if err := db.QueryRow("SELECT current_database()").Scan(&name); err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(name, "_compat_test") {
		t.Fatal("requires an isolated *_compat_test database")
	}
	tx, err := client.Tx(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = tx.Rollback() }()
	c := tx.Client()
	bypass := contextkeys.NewPrivacyBypassContext(context.WithValue(context.Background(), contextkeys.HouseholdIDKey(), 8589934692))
	old := c.Snapshot.Query().Where(snapshot.NoteEQ("Compatibility fixture: legacy review")).OnlyX(bypass)
	oldEntries := old.QuerySnapshotEntries().AllX(bypass)
	oldRates := old.QuerySnapshotRates().AllX(bypass)
	if len(oldEntries) == 0 || len(oldRates) == 0 || old.FormatVersion != 0 {
		t.Fatal("missing legacy fixture")
	}
	// Exercise normal household scoping and authorization after the migration.
	if c.Household.GetX(bypass, old.HouseholdID).IsDemo {
		t.Fatal("compatibility fixture must be a non-demo household")
	}
	ctx := memberCallCtx(c, oldEntries[0].UserID, old.HouseholdID)
	mr := &mutationResolver{Resolver: newMemberTestResolver(c)}
	accounts := c.Account.Query().Where(account.ArchivedEQ(false)).AllX(ctx)
	expected := make([]*model.ReviewAccountVersion, 0, len(accounts))
	for _, a := range accounts {
		revision, err := accountReviewRevision(ctx, c, a)
		if err != nil {
			t.Fatal(err)
		}
		expected = append(expected, &model.ReviewAccountVersion{ID: a.ID, Revision: revision})
	}
	note := "Compatibility fixture: new review"
	edge, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{Note: &note}, expected)
	if err != nil {
		t.Fatal(err)
	}
	saved := edge.Node
	if saved.FormatVersion != 1 {
		t.Fatal("missing detailed snapshot")
	}
	doc, err := resolveSnapshotReview(ctx, c, saved)
	if err != nil {
		t.Fatal(err)
	}
	if doc.Version != 2 || !doc.Complete || len(doc.Accounts) != len(accounts) || len(doc.ActiveAccountIds) != len(accounts) {
		t.Fatal("capture was not full-household")
	}
	currencies := c.HouseholdCurrency.Query().AllX(ctx)
	if len(doc.Rates) != len(currencies)*(len(currencies)-1) {
		t.Fatal("incomplete captured FX pairs")
	}
	for _, r := range doc.Rates {
		if !decimal.RequireFromString(r.Rate).IsPositive() {
			t.Fatal("invalid captured FX")
		}
	}
	if n := saved.QuerySnapshotEntries().CountX(ctx); n != 0 {
		t.Fatal("new snapshot duplicated derived category totals")
	}
	if n := saved.QuerySnapshotRates().CountX(ctx); n != len(doc.Rates) {
		t.Fatal("snapshot rates disagree with capture")
	}
	if n := old.QuerySnapshotEntries().CountX(ctx); n != len(oldEntries) {
		t.Fatal("legacy entries changed")
	}
	if n := old.QuerySnapshotRates().CountX(ctx); n != len(oldRates) {
		t.Fatal("legacy FX changed")
	}
	// Read both formats through the same GraphQL fields used by the new UI.
	api := handler.NewDefaultServer(NewExecutableSchema(Config{Resolvers: newMemberTestResolver(c)}))
	api.AroundOperations(WithSnapshotReviewCache)
	body := `{"query":"query { household { snapshots(last: 10) { edges { node { id note review { version complete accounts { accountId cash value holdings { investmentId quantity price average needsReview } } rates { from to rate } } snapshotEntries { userID liquidity investment property receivable liability householdCurrency { code } } snapshotRates { rate fromCurrency { code } toCurrency { code } } } } } } }"}`
	req := httptest.NewRequest("POST", "/query", strings.NewReader(body)).WithContext(ctx)
	req.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	api.ServeHTTP(response, req)
	var payload struct {
		Errors []json.RawMessage `json:"errors"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &payload); err != nil || len(payload.Errors) != 0 || response.Code != 200 {
		t.Fatalf("mixed-format GraphQL query failed: %s", response.Body.String())
	}
	for _, text := range []string{"Compatibility fixture: legacy review", "Compatibility fixture: new review", `"review":null`, `"snapshotEntries":[]`} {
		if !strings.Contains(response.Body.String(), text) {
			t.Fatalf("mixed-format response missing %s", text)
		}
	}
	// Every captured holding is explicitly unconfirmed after the migration.
	for _, a := range doc.Accounts {
		for _, h := range a.Holdings {
			inv := c.Investment.GetX(ctx, h.InvestmentID)
			if h.Price != inv.Quote.String() || h.Quantity != inv.Amount.String() || h.Value != inv.Value.String() {
				t.Fatal("holding capture mismatch")
			}
			if !inv.Amount.IsZero() && (!h.NeedsReview || h.Average != nil) {
				t.Fatal("migration fabricated a manual average")
			}
		}
	}

	// Repeating a whole-household capture writes a stamp and FX, but no observations.
	accountCount := c.SnapshotAccount.Query().CountX(ctx)
	holdingCount := c.SnapshotInvestment.Query().CountX(ctx)
	repeat, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if c.SnapshotAccount.Query().CountX(ctx) != accountCount || c.SnapshotInvestment.Query().CountX(ctx) != holdingCount {
		t.Fatal("unchanged capture duplicated observations")
	}
	repeated, err := resolveSnapshotReview(ctx, c, repeat.Node)
	if err != nil || !reflect.DeepEqual(repeated, doc) {
		t.Fatalf("reused observations differ: %v", err)
	}
	// Observations must survive deletion of their originating journal entry.
	if _, err := mr.DeleteSnapshot(ctx, saved.ID); err != nil {
		t.Fatal(err)
	}
	reused, err := resolveSnapshotReview(ctx, c, repeat.Node)
	if err != nil || !reflect.DeepEqual(reused, doc) {
		t.Fatalf("deleting a source stamp corrupted later history: %v", err)
	}
	saved = repeat.Node
	// Quote changes add only a holding observation, and prior reviews stay frozen.
	first := c.Investment.Query().Where(investment.ArchivedEQ(false)).FirstX(ctx)
	c.Investment.UpdateOneID(first.ID).SetQuote(first.Quote.Add(decimal.NewFromInt(1))).SaveX(ctx)
	quoteSnapshot, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if c.SnapshotAccount.Query().CountX(ctx) != accountCount || c.SnapshotInvestment.Query().CountX(ctx) != holdingCount+1 {
		t.Fatal("quote-only capture duplicated cash observations")
	}
	quoteDoc, err := resolveSnapshotReview(ctx, c, quoteSnapshot.Node)
	if err != nil || reflect.DeepEqual(quoteDoc, doc) {
		t.Fatal("new quote not captured")
	}
	// An empty account/holding is archived, recorded once, and can be restored.
	empty := c.Account.Create().SetHouseholdID(old.HouseholdID).SetUserID(oldEntries[0].UserID).SetHouseholdCurrencyID(first.HouseholdCurrencyID).SetName("Archive test").SetType(account.TypeInvestment).SaveX(ctx)
	holding := c.Investment.Create().SetHouseholdID(old.HouseholdID).SetUserID(empty.UserID).SetAccountID(empty.ID).SetHouseholdCurrencyID(empty.HouseholdCurrencyID).SetName("Empty holding").SetSymbol("EMPTY").SetType(investment.TypeStock).SetQuote(decimal.NewFromInt(10)).SaveX(ctx)
	beforeArchive, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := mr.DeleteAccount(ctx, empty.ID); err != nil {
		t.Fatal(err)
	}
	if !c.Account.GetX(ctx, empty.ID).Archived || !c.Investment.GetX(ctx, holding.ID).Archived {
		t.Fatal("delete must archive identities")
	}
	afterArchive, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{}, nil)
	if err != nil {
		t.Fatal(err)
	}
	beforeDoc, err := resolveSnapshotReview(ctx, c, beforeArchive.Node)
	if err != nil {
		t.Fatal(err)
	}
	afterDoc, err := resolveSnapshotReview(ctx, c, afterArchive.Node)
	if err != nil {
		t.Fatal(err)
	}
	checkArchive := func(d *model.SnapshotReview, want bool) {
		t.Helper()
		for _, a := range d.Accounts {
			if a.AccountID == empty.ID {
				if a.Archived != want || len(a.Holdings) != 1 || a.Holdings[0].Archived != want {
					t.Fatal("historical archive state changed")
				}
				return
			}
		}
		t.Fatal("archived entity lost its history")
	}
	checkArchive(beforeDoc, false)
	checkArchive(afterDoc, true)
	if _, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{}, nil); err != nil {
		t.Fatal(err)
	}
	if c.SnapshotAccount.Query().Where(snapshotaccount.AccountIDEQ(empty.ID)).CountX(ctx) != 2 || c.SnapshotInvestment.Query().Where(snapshotinvestment.InvestmentIDEQ(holding.ID)).CountX(ctx) != 2 {
		t.Fatal("unchanged archive produced redundant history")
	}
	if _, err := mr.UnarchiveAccount(ctx, empty.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := mr.UnarchiveInvestment(ctx, holding.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{}, nil); err != nil {
		t.Fatal(err)
	}
	if c.SnapshotAccount.Query().Where(snapshotaccount.AccountIDEQ(empty.ID)).CountX(ctx) != 3 {
		t.Fatal("restoration not recorded")
	}
	// A cash-only change writes only the affected account; investment totals derive.
	category := c.TransactionCategory.Query().Where(transactioncategory.TypeEQ(transactioncategory.TypeIncome)).FirstX(ctx)
	txn := c.Transaction.Create().SetHouseholdID(old.HouseholdID).SetUserID(empty.UserID).SetCategoryID(category.ID).SetDatetime(time.Now()).SaveX(ctx)
	c.TransactionEntry.Create().SetHouseholdID(old.HouseholdID).SetAccountID(empty.ID).SetTransactionID(txn.ID).SetAmount(decimal.NewFromInt(20)).SaveX(ctx)
	holdingCount = c.SnapshotInvestment.Query().CountX(ctx)
	if _, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{}, nil); err != nil {
		t.Fatal(err)
	}
	if c.SnapshotAccount.Query().Where(snapshotaccount.AccountIDEQ(empty.ID)).CountX(ctx) != 4 || c.SnapshotInvestment.Query().CountX(ctx) != holdingCount {
		t.Fatal("cash-only change duplicated holdings")
	}
	if _, err := mr.ArchiveAccount(ctx, empty.ID); err == nil {
		t.Fatal("nonempty account archived")
	}
	// FX alone still advances full-household value without duplicating observations.
	accountCount = c.SnapshotAccount.Query().CountX(ctx)
	var fx *ent.HouseholdRate
	for _, rate := range c.HouseholdRate.Query().AllX(ctx) {
		if rate.FromHouseholdCurrencyID != rate.ToHouseholdCurrencyID {
			fx = rate
			break
		}
	}
	if fx == nil {
		t.Fatal("no non-identity FX fixture")
	}
	c.HouseholdRate.UpdateOneID(fx.ID).SetRate(fx.Rate.Add(decimal.RequireFromString("0.001"))).SaveX(ctx)
	fxSnapshot, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if c.SnapshotAccount.Query().CountX(ctx) != accountCount || c.SnapshotInvestment.Query().CountX(ctx) != holdingCount {
		t.Fatal("FX-only capture duplicated observations")
	}
	fxDoc, err := resolveSnapshotReview(ctx, c, fxSnapshot.Node)
	if err != nil || reflect.DeepEqual(fxDoc.Rates, doc.Rates) {
		t.Fatal("new FX not frozen")
	}
	// Notes can change; the captured values cannot.
	edited := "Edited journal note"
	updated, err := mr.UpdateSnapshot(ctx, saved.ID, ent.UpdateSnapshotInput{Note: &edited})
	afterNote, readErr := resolveSnapshotReview(ctx, c, updated.Node)
	if err != nil || readErr != nil || !reflect.DeepEqual(afterNote, doc) {
		t.Fatalf("note changed financial values: %v", err)
	}
	oldNote := "Edited legacy note"
	if _, err := mr.UpdateSnapshot(ctx, old.ID, ent.UpdateSnapshotInput{Note: &oldNote}); err != nil {
		t.Fatal(err)
	}
	if c.Snapshot.GetX(ctx, old.ID).FormatVersion != 0 {
		t.Fatal("legacy note edit fabricated details")
	}
	// Confirming is manual. Trade edits only mark it stale, preserving that input.
	lot := c.InvestmentLot.Query().FirstX(ctx)
	inv := c.Investment.GetX(ctx, lot.InvestmentID)
	confirmed, err := confirmAverage(ctx, c, inv.ID, "7.125", inv.Amount.String(), inv.HoldingsChangedAt)
	if err != nil || averageNeedsReview(confirmed) {
		t.Fatalf("manual confirmation failed: %v", err)
	}
	c.InvestmentLot.UpdateOneID(lot.ID).SetPrice(lot.Price.Add(decimal.NewFromInt(1))).SaveX(ctx)
	stale := c.Investment.GetX(ctx, inv.ID)
	if stale.ConfirmedAverageCost == nil || !decimal.RequireFromString(*stale.ConfirmedAverageCost).Equal(decimal.RequireFromString("7.125")) || !averageNeedsReview(stale) {
		t.Fatal("trade edit recomputed or failed to invalidate average")
	}
	c.InvestmentLot.UpdateOneID(lot.ID).SetAmount(lot.Amount.Add(decimal.NewFromInt(1))).SaveX(ctx)
	changed := c.Investment.GetX(ctx, inv.ID)
	if !changed.Amount.Equal(inv.Amount.Add(decimal.NewFromInt(1))) || !changed.Value.Equal(changed.Amount.Mul(changed.Quote)) {
		t.Fatal("quantity or valuation trigger broken")
	}
	afterTrade, err := resolveSnapshotReview(ctx, c, saved)
	if err != nil || !reflect.DeepEqual(afterTrade, doc) {
		t.Fatal("later trades altered frozen snapshot")
	}
	count := c.Snapshot.Query().CountX(ctx)
	if _, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{}, expected); err == nil {
		t.Fatal("stale review revision accepted")
	}
	if c.Snapshot.Query().CountX(ctx) != count {
		t.Fatal("failed review left partial snapshot")
	}
	// Batched chart reads must match independent as-of reads across all changes,
	// including reused observations, archive/restore transitions and FX-only stamps.
	stamps := c.Snapshot.Query().AllX(ctx)
	ids := make([]int, 0, len(stamps))
	for _, stamp := range stamps {
		ids = append(ids, stamp.ID)
	}
	batch, err := loadSnapshotReviews(ctx, c, ids)
	if err != nil {
		t.Fatal(err)
	}
	for _, stamp := range stamps {
		single, err := resolveSnapshotReview(ctx, c, stamp)
		if err != nil || !reflect.DeepEqual(single, batch[stamp.ID]) {
			t.Fatalf("batch differs at snapshot %d: %v", stamp.ID, err)
		}
	}
	if _, err := mr.DeleteSnapshot(ctx, saved.ID); err != nil {
		t.Fatal(err)
	}
	if c.SnapshotRate.Query().Where(snapshotrate.SnapshotIDEQ(saved.ID)).CountX(ctx) != 0 || c.SnapshotEntry.Query().Where(snapshotentry.SnapshotIDEQ(saved.ID)).CountX(ctx) != 0 {
		t.Fatal("snapshot delete left child rows")
	}
}

func TestSnapshotPostgresDatabaseGuards(t *testing.T) {
	dsn := os.Getenv("REVIEW_TEST_DATABASE_URL")
	if dsn == "" {
		if os.Getenv("CI") == "true" {
			t.Fatal("CI must configure REVIEW_TEST_DATABASE_URL and prepare the PostgreSQL compatibility fixture")
		}
		t.Skip("isolated PostgreSQL fixture required")
	}
	client, db, err := database.Connect(dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = client.Close() }()
	var name string
	if err := db.QueryRow("SELECT current_database()").Scan(&name); err != nil || !strings.HasSuffix(name, "_compat_test") {
		t.Fatal("isolated *_compat_test database required")
	}
	cases := []struct{ name, query, message string }{
		{"category identity", "UPDATE accounts SET category=CASE WHEN category IS NULL THEN 'tfsa' ELSE NULL END WHERE id=(SELECT min(id) FROM accounts)", "immutable"},
		{"owner identity", "UPDATE accounts a SET user_id=(SELECT id FROM users WHERE id<>a.user_id LIMIT 1) WHERE id=(SELECT min(id) FROM accounts)", "immutable"},
		{"holding identity", "UPDATE investments SET symbol='CHANGED' WHERE id=(SELECT min(id) FROM investments)", "immutable"},
		{"nonempty archive", "UPDATE accounts SET archived=true WHERE id=(SELECT min(id) FROM accounts WHERE balance<>0)", "archived_account_empty"},
		{"snapshot stamp", "UPDATE snapshots SET create_time=create_time+interval '1 day' WHERE id=(SELECT min(id) FROM snapshots)", "immutable"},
		{"frozen FX", "UPDATE snapshot_rates SET rate=rate+1 WHERE id=(SELECT min(id) FROM snapshot_rates)", "immutable"},
		{"legacy totals", "UPDATE snapshot_entries SET liquidity=liquidity+1 WHERE id=(SELECT min(id) FROM snapshot_entries)", "immutable"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			tx, err := db.BeginTx(context.Background(), nil)
			if err != nil {
				t.Fatal(err)
			}
			defer func() { _ = tx.Rollback() }()
			if _, err := tx.Exec(tc.query); err == nil || !strings.Contains(err.Error(), tc.message) {
				t.Fatalf("expected %s guard, got %v", tc.name, err)
			}
		})
	}
	// Append-only observation guards are exercised with temporary records, even on
	// a legacy-only migration fixture. All changes remain inside one rolled-back TX.
	for _, table := range []string{"snapshot_accounts", "snapshot_investments"} {
		t.Run(table, func(t *testing.T) {
			tx, err := db.BeginTx(context.Background(), nil)
			if err != nil {
				t.Fatal(err)
			}
			defer func() { _ = tx.Rollback() }()
			insert := "INSERT INTO snapshot_accounts(household_id,account_id,create_time,balance,archived) SELECT household_id,id,clock_timestamp(),0,false FROM accounts LIMIT 1"
			if table == "snapshot_investments" {
				insert = "INSERT INTO snapshot_investments(household_id,investment_id,create_time,quantity,average_cost,market_price,needs_review,archived) SELECT household_id,id,clock_timestamp(),0,NULL,0,false,false FROM investments LIMIT 1"
			}
			if _, err := tx.Exec(insert); err != nil {
				t.Fatal(err)
			}
			if _, err := tx.Exec("UPDATE " + table + " SET create_time=clock_timestamp()"); err == nil || !strings.Contains(err.Error(), "immutable") {
				t.Fatalf("observation changed: %v", err)
			}
		})
	}
}

func TestSnapshotPostgresDeletedTradeInvalidatesAverageWithoutRewritingHistory(t *testing.T) {
	client, baseCtx, userID := snapshotPostgresClient(t)
	for _, deletion := range []string{"lot", "transaction cascade"} {
		t.Run(deletion, func(t *testing.T) {
			tx, err := client.Tx(baseCtx)
			if err != nil {
				t.Fatal(err)
			}
			defer func() { _ = tx.Rollback() }()
			c := tx.Client()
			ctx := memberCallCtx(c, userID, contextkeys.GetHouseholdID(baseCtx))
			mr := &mutationResolver{Resolver: newMemberTestResolver(c)}
			sourceLot := c.InvestmentLot.Query().FirstX(ctx)
			sourceTxn := c.Transaction.GetX(ctx, sourceLot.TransactionID)
			inv := c.Investment.GetX(ctx, sourceLot.InvestmentID)
			if !inv.Amount.IsPositive() {
				t.Fatal("fixture must retain a positive holding after the extra lot is deleted")
			}
			// The trade's event date predates confirmation. Deletion must still stale
			// the average using mutation time, even though that trade row disappears.
			txn := c.Transaction.Create().SetHouseholdID(inv.HouseholdID).SetUserID(inv.UserID).SetCategoryID(sourceTxn.CategoryID).SetDatetime(time.Now().AddDate(-1, 0, 0)).SaveX(ctx)
			extra := c.InvestmentLot.Create().SetHouseholdID(inv.HouseholdID).SetInvestmentID(inv.ID).SetTransactionID(txn.ID).SetAmount(decimal.NewFromInt(1)).SetPrice(decimal.NewFromInt(8)).SaveX(ctx)
			current := c.Investment.GetX(ctx, inv.ID)
			confirmed, err := confirmAverage(ctx, c, inv.ID, "7.125", current.Amount.String(), current.HoldingsChangedAt)
			if err != nil || averageNeedsReview(confirmed) {
				t.Fatalf("manual confirmation failed: %v", err)
			}
			// Simulate a confirmation saved by an application clock ahead of the
			// database. A later deletion must still advance beyond that marker.
			futureConfirmation := time.Now().UTC().Add(time.Hour).Truncate(time.Microsecond)
			confirmed = c.Investment.UpdateOneID(inv.ID).SetAverageCostConfirmedAt(futureConfirmation).SaveX(ctx)
			saved, err := mr.CreateSnapshot(ctx, ent.CreateSnapshotInput{}, nil)
			if err != nil {
				t.Fatal(err)
			}
			frozen, err := resolveSnapshotReview(ctx, c, saved.Node)
			if err != nil {
				t.Fatal(err)
			}
			if deletion == "lot" {
				err = c.InvestmentLot.DeleteOneID(extra.ID).Exec(ctx)
			} else {
				_, err = mr.DeleteTransaction(ctx, txn.ID)
			}
			if err != nil {
				t.Fatal(err)
			}
			stale := c.Investment.GetX(ctx, inv.ID)
			if !stale.Amount.Equal(inv.Amount) || stale.ConfirmedAverageCost == nil || *stale.ConfirmedAverageCost != *confirmed.ConfirmedAverageCost || !averageNeedsReview(stale) {
				t.Fatal("deleted backdated trade failed to preserve and invalidate the manual average")
			}
			if stale.HoldingsChangedAt == nil || !stale.HoldingsChangedAt.After(*confirmed.AverageCostConfirmedAt) {
				t.Fatal("trade deletion was not recorded at mutation time")
			}
			if stale.AverageCostConfirmedAt == nil || !stale.AverageCostConfirmedAt.Equal(*confirmed.AverageCostConfirmedAt) {
				t.Fatal("trade deletion rewrote the manual confirmation")
			}
			if _, err := c.InvestmentLot.Get(ctx, extra.ID); !ent.IsNotFound(err) {
				t.Fatal("deleted trade lot still present")
			}
			after, err := resolveSnapshotReview(ctx, c, saved.Node)
			if err != nil || !reflect.DeepEqual(after, frozen) {
				t.Fatalf("trade deletion rewrote the reviewed snapshot: %v", err)
			}
		})
	}
}

func TestSnapshotPostgresTradeEditsStayStaleAcrossClockSkew(t *testing.T) {
	client, baseCtx, userID := snapshotPostgresClient(t)
	for _, change := range []string{"lot price", "transaction date", "transaction pending"} {
		t.Run(change, func(t *testing.T) {
			tx, err := client.Tx(baseCtx)
			if err != nil {
				t.Fatal(err)
			}
			defer func() { _ = tx.Rollback() }()
			c := tx.Client()
			ctx := memberCallCtx(c, userID, contextkeys.GetHouseholdID(baseCtx))
			mr := &mutationResolver{Resolver: newMemberTestResolver(c)}
			lot := c.InvestmentLot.Query().FirstX(ctx)
			txn := c.Transaction.GetX(ctx, lot.TransactionID)
			inv := c.Investment.GetX(ctx, lot.InvestmentID)
			// This is both a database clock previously ahead of the application and
			// a database clock rolled backward after recording an earlier trade.
			futureChange := time.Now().UTC().Add(time.Hour).Truncate(time.Microsecond)
			c.Investment.UpdateOneID(inv.ID).SetHoldingsChangedAt(futureChange).SaveX(ctx)
			confirmed, err := confirmAverage(ctx, c, inv.ID, "7.125", inv.Amount.String(), &futureChange)
			if err != nil || averageNeedsReview(confirmed) {
				t.Fatalf("future marker confirmation failed: %v", err)
			}
			switch change {
			case "lot price":
				price := lot.Price.Add(decimal.NewFromInt(1))
				_, err = mr.UpdateInvestmentLot(ctx, lot.ID, ent.UpdateInvestmentLotInput{Price: &price})
			case "transaction date":
				date := txn.Datetime.Add(-24 * time.Hour)
				_, err = mr.UpdateTransaction(ctx, txn.ID, ent.UpdateTransactionInput{Datetime: &date})
			case "transaction pending":
				pending := !txn.Pending
				_, err = mr.UpdateTransaction(ctx, txn.ID, ent.UpdateTransactionInput{Pending: &pending})
			}
			if err != nil {
				t.Fatal(err)
			}
			stale := c.Investment.GetX(ctx, inv.ID)
			if stale.HoldingsChangedAt == nil || !stale.HoldingsChangedAt.After(*confirmed.AverageCostConfirmedAt) || !averageNeedsReview(stale) {
				t.Fatal("trade edit left the future-dated confirmation fresh")
			}
			if stale.ConfirmedAverageCost == nil || *stale.ConfirmedAverageCost != *confirmed.ConfirmedAverageCost {
				t.Fatal("trade edit recalculated the manual average")
			}
			if _, err := confirmAverage(ctx, c, inv.ID, "8", stale.Amount.String(), &futureChange); err == nil {
				t.Fatal("stale confirmation marker accepted after clock-skewed trade edit")
			}
			reviewed, err := confirmAverage(ctx, c, inv.ID, "8", stale.Amount.String(), stale.HoldingsChangedAt)
			if err != nil || averageNeedsReview(reviewed) {
				t.Fatalf("latest edited state could not be reviewed: %v", err)
			}
		})
	}
}
