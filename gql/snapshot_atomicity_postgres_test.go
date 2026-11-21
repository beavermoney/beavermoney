package gql

import (
	"context"
	"errors"
	"net/http/httptest"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"beavermoney.app/cmd/server/database"
	"beavermoney.app/ent"
	"beavermoney.app/ent/snapshot"
	"beavermoney.app/internal/contextkeys"
	"entgo.io/contrib/entgql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/shopspring/decimal"
)

func snapshotPostgresClient(t *testing.T) (*ent.Client, context.Context, int) {
	t.Helper()
	dsn := os.Getenv("REVIEW_TEST_DATABASE_URL")
	if dsn == "" {
		if os.Getenv("CI") == "true" {
			t.Fatal("CI must configure REVIEW_TEST_DATABASE_URL and prepare the PostgreSQL compatibility fixture")
		}
		t.Skip("isolated PostgreSQL fixture required")
	}
	c, db, err := database.Connect(dsn)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = c.Close() })
	var name string
	if err := db.QueryRow("SELECT current_database()").Scan(&name); err != nil || !strings.HasSuffix(name, "_compat_test") {
		t.Fatal("requires isolated *_compat_test database")
	}
	bypass := contextkeys.NewPrivacyBypassContext(context.WithValue(context.Background(), contextkeys.HouseholdIDKey(), 8589934692))
	old := c.Snapshot.Query().Where(snapshot.NoteEQ("Compatibility fixture: legacy review")).OnlyX(bypass)
	userID := old.QuerySnapshotEntries().FirstX(bypass).UserID
	return c, memberCallCtx(c, userID, old.HouseholdID), userID
}

func TestSnapshotPostgresConcurrentCapturesAndTradeEdits(t *testing.T) {
	c, ctx, userID := snapshotPostgresClient(t)
	// Same-value lot edits exercise the investment -> account trigger path. All
	// fixture holdings are already unconfirmed; their frozen state is unchanged.
	lot := c.InvestmentLot.Query().FirstX(ctx)
	inv := c.Investment.GetX(ctx, lot.InvestmentID)
	beforeAccounts := c.SnapshotAccount.Query().CountX(ctx)
	beforeHoldings := c.SnapshotInvestment.Query().CountX(ctx)
	note := "Concurrent capture regression " + time.Now().UTC().Format(time.RFC3339Nano)
	t.Cleanup(func() {
		cleanupCtx := memberCallCtx(c, userID, contextkeys.GetHouseholdID(ctx))
		// Only remove this test's journal stamps; shared observations are untouched.
		if _, err := c.Snapshot.Delete().Where(snapshot.NoteEQ(note)).Exec(cleanupCtx); err != nil {
			t.Error(err)
		}
		update := c.Investment.UpdateOneID(inv.ID)
		if inv.HoldingsChangedAt == nil {
			update.ClearHoldingsChangedAt()
		} else {
			update.SetHoldingsChangedAt(*inv.HoldingsChangedAt)
		}
		if err := update.Exec(cleanupCtx); err != nil {
			t.Error(err)
		}
	})
	const workers = 8
	start := make(chan struct{})
	results := make(chan error, workers)
	var wg sync.WaitGroup
	for index := range workers {
		wg.Go(func() {
			tx, err := c.Tx(ctx)
			if err != nil {
				results <- err
				return
			}
			defer func() { _ = tx.Rollback() }()
			callCtx, cancel := context.WithTimeout(memberCallCtx(tx.Client(), userID, contextkeys.GetHouseholdID(ctx)), 15*time.Second)
			defer cancel()
			mr := &mutationResolver{Resolver: newMemberTestResolver(tx.Client())}
			<-start
			if index%2 == 0 {
				_, err = mr.CreateSnapshot(callCtx, ent.CreateSnapshotInput{Note: &note}, nil)
			} else {
				_, err = mr.UpdateInvestmentLot(callCtx, lot.ID, ent.UpdateInvestmentLotInput{Amount: &lot.Amount, Price: &lot.Price})
			}
			if err == nil {
				err = tx.Commit()
			}
			results <- err
		})
	}
	close(start)
	wg.Wait()
	close(results)
	for err := range results {
		if err != nil {
			t.Fatal(err)
		}
	}
	rows := c.Snapshot.Query().Where(snapshot.NoteEQ(note)).AllX(ctx)
	if len(rows) != workers/2 {
		t.Fatalf("expected four successful captures, got %d", len(rows))
	}
	times := map[string]bool{}
	for _, s := range rows {
		stamp := s.CreateTime.Format(time.RFC3339Nano)
		if times[stamp] {
			t.Fatal("simultaneous captures reused a timestamp")
		}
		times[stamp] = true
		if _, err := resolveSnapshotReview(ctx, c, s); err != nil {
			t.Fatal(err)
		}
	}
	if c.SnapshotAccount.Query().CountX(ctx) != beforeAccounts || c.SnapshotInvestment.Query().CountX(ctx) != beforeHoldings {
		t.Fatal("simultaneous saves duplicated unchanged observations")
	}
}

func TestSnapshotPostgresMutationRollsBackOnLateFXFailure(t *testing.T) {
	c, ctx, _ := snapshotPostgresClient(t)
	beforeStamps := c.Snapshot.Query().CountX(ctx)
	beforeRates := c.SnapshotRate.Query().CountX(ctx)
	beforeAccounts := c.SnapshotAccount.Query().CountX(ctx)
	beforeHoldings := c.SnapshotInvestment.Query().CountX(ctx)
	// Force a new observation before the late failure. An unchanged fixture
	// would only prove rollback of the stamp and rate rows, not observations.
	holding := c.Investment.Query().FirstX(ctx)
	if err := c.Investment.UpdateOneID(holding.ID).SetQuote(holding.Quote.Add(decimal.NewFromInt(1))).Exec(ctx); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := c.Investment.UpdateOneID(holding.ID).SetQuote(holding.Quote).Exec(ctx); err != nil {
			t.Error(err)
		}
	})
	createdRates := 0
	wroteObservation := false
	c.SnapshotRate.Use(func(next ent.Mutator) ent.Mutator {
		return ent.MutateFunc(func(ctx context.Context, m ent.Mutation) (ent.Value, error) {
			createdRates++
			if createdRates == 2 {
				pending := ent.FromContext(ctx)
				count, err := pending.SnapshotInvestment.Query().Count(ctx)
				if err != nil {
					return nil, err
				}
				wroteObservation = count > beforeHoldings
				return nil, errors.New("injected late FX write failure")
			}
			return next.Mutate(ctx, m)
		})
	})
	api := handler.NewDefaultServer(NewExecutableSchema(Config{Resolvers: newMemberTestResolver(c)}))
	api.Use(entgql.Transactioner{TxOpener: c})
	body := `{"query":"mutation { createSnapshot(input: {note: \"Must roll back\"}) { node { id } } }"}`
	req := httptest.NewRequest("POST", "/query", strings.NewReader(body)).WithContext(ctx)
	req.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	api.ServeHTTP(response, req)
	if !wroteObservation {
		t.Fatal("failure did not occur after writing a new investment observation")
	}
	if createdRates != 2 || !strings.Contains(response.Body.String(), "injected late FX write failure") {
		t.Fatalf("failure path not exercised: %s", response.Body.String())
	}
	if c.Snapshot.Query().CountX(ctx) != beforeStamps || c.SnapshotRate.Query().CountX(ctx) != beforeRates || c.SnapshotAccount.Query().CountX(ctx) != beforeAccounts || c.SnapshotInvestment.Query().CountX(ctx) != beforeHoldings {
		t.Fatal("failed snapshot left partially committed capture data")
	}
}
