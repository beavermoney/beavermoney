package gql

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/merchant"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/gql/model"
	"beavermoney.app/internal/contextkeys"
	"entgo.io/contrib/entgql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/shopspring/decimal"
)

func merchantPostgresFixture(t *testing.T) (*ent.Client, context.Context, *mutationResolver, *ent.Account, *ent.TransactionCategory) {
	t.Helper()
	base, ctx, userID := snapshotPostgresClient(t)
	tx, err := base.Tx(ctx)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = tx.Rollback() })
	c := tx.Client()
	ctx = memberCallCtx(c, userID, contextkeys.GetHouseholdID(ctx))
	r := &mutationResolver{newMemberTestResolver(c)}
	acc := c.Account.Query().Where(account.ArchivedEQ(false), account.TypeEQ(account.TypeLiquidity)).FirstX(ctx)
	cat := c.TransactionCategory.Create().SetHouseholdID(contextkeys.GetHouseholdID(ctx)).SetType(transactioncategory.TypeExpense).SetName("Merchant test").SetIcon("food").SaveX(ctx)
	return c, ctx, r, acc, cat
}
func merchantTestExpense(t *testing.T, ctx context.Context, r *mutationResolver, acc *ent.Account, cat *ent.TransactionCategory, id *int, name *string) *ent.Transaction {
	t.Helper()
	edge, err := r.CreateExpense(ctx, model.CreateExpenseInputCustom{MerchantID: id, MerchantName: name, Transaction: &ent.CreateTransactionInput{UserID: contextkeys.GetUserID(ctx), CategoryID: cat.ID, Datetime: time.Now().Add(-time.Minute)}, TransactionEntry: &ent.CreateTransactionEntryInput{AccountID: acc.ID, Amount: decimal.RequireFromString("-12.3456789")}})
	if err != nil {
		t.Fatal(err)
	}
	return edge.Node
}
func TestMerchantPostgresMergeRetainsExpenseAndHardDeletesSource(t *testing.T) {
	c, ctx, r, acc, cat := merchantPostgresFixture(t)
	source, err := r.CreateMerchant(ctx, "Source", nil)
	if err != nil {
		t.Fatal(err)
	}
	target, err := r.CreateMerchant(ctx, "Target", nil)
	if err != nil {
		t.Fatal(err)
	}
	a := merchantTestExpense(t, ctx, r, acc, cat, &source.ID, nil)
	b := merchantTestExpense(t, ctx, r, acc, cat, &source.ID, nil)
	c.Transaction.UpdateOneID(b.ID).SetPending(true).SetExcludeFromReports(true).ExecX(ctx)
	cash := c.Account.GetX(ctx, acc.ID).Balance
	entries := c.TransactionEntry.Query().CountX(ctx)
	result, err := r.MergeMerchant(ctx, source.ID, target.ID)
	if err != nil {
		t.Fatal(err)
	}
	if result.ReassignedCount != 2 || result.DeletedMerchantID != source.ID {
		t.Fatal(result)
	}
	if _, err := c.Merchant.Get(ctx, source.ID); !ent.IsNotFound(err) {
		t.Fatalf("source remains %v", err)
	}
	for _, id := range []int{a.ID, b.ID} {
		txn := c.Transaction.GetX(ctx, id)
		if txn.MerchantID == nil || *txn.MerchantID != target.ID {
			t.Fatal("assignment lost")
		}
	}
	if c.TransactionEntry.Query().CountX(ctx) != entries || !c.Account.GetX(ctx, acc.ID).Balance.Equal(cash) {
		t.Fatal("merge altered finances")
	}
	if _, err := r.MergeMerchant(ctx, target.ID, target.ID); err == nil {
		t.Fatal("self merge allowed")
	}
	ctx = context.WithValue(ctx, contextkeys.DisplayCurrencyKey(), &contextkeys.DisplayCurrency{HouseholdCurrencyID: acc.HouseholdCurrencyID, Code: acc.QueryHouseholdCurrency().OnlyX(ctx).Code})
	insight, err := r.merchantDetail(ctx, target, model.TimePeriodInput{}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if insight.Period.Total != "12.3456789" || insight.Period.TransactionCount != 1 {
		t.Fatalf("decimal/report total %+v", insight.Period)
	}
	// PostgreSQL numeric must preserve the exact FX and selected entry-owner slice.
	foreign := c.Account.Query().Where(account.HouseholdCurrencyIDNEQ(acc.HouseholdCurrencyID), account.UserIDNEQ(acc.UserID)).FirstX(ctx)
	c.TransactionEntry.Create().SetHouseholdID(cat.HouseholdID).SetAccountID(foreign.ID).SetTransactionID(a.ID).SetAmount(decimal.RequireFromString("-5.23")).SaveX(ctx)
	scoped, err := r.merchantDetail(ctx, target, model.TimePeriodInput{}, []int{foreign.UserID})
	if err != nil {
		t.Fatal(err)
	}
	if scoped.Period.Total != "7.1651" || scoped.Period.TransactionCount != 1 {
		t.Fatalf("exact foreign owner total %+v", scoped.Period)
	}
	// Positive expense entries are refunds: retain their sign to reduce net spend.
	c.TransactionEntry.Create().SetHouseholdID(cat.HouseholdID).SetAccountID(acc.ID).SetTransactionID(a.ID).SetAmount(decimal.RequireFromString("2.0000001")).SaveX(ctx)
	insight, err = r.merchantDetail(ctx, target, model.TimePeriodInput{}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if insight.Period.Total != "17.5107788" || insight.Period.TransactionCount != 1 {
		t.Fatalf("refund/split %+v", insight.Period)
	}
}
func TestMerchantPostgresDatabaseGuards(t *testing.T) {
	for _, kind := range []string{"cross household", "nonexpense", "referenced deletion", "category mutation"} {
		t.Run(kind, func(t *testing.T) {
			c, ctx, r, acc, cat := merchantPostgresFixture(t)
			m, err := r.CreateMerchant(ctx, "Guard", nil)
			if err != nil {
				t.Fatal(err)
			}
			txn := merchantTestExpense(t, ctx, r, acc, cat, &m.ID, nil)
			switch kind {
			case "cross household":
				other := c.Household.Create().SetName("Foreign merchant test").SetLocale("en").SaveX(contextkeys.NewPrivacyBypassContext(ctx))
				otherctx := context.WithValue(ctx, contextkeys.HouseholdIDKey(), other.ID)
				foreign := c.Merchant.Create().SetHouseholdID(other.ID).SetName("Foreign").SetNameKey("foreign").SaveX(otherctx)
				err = c.Transaction.UpdateOneID(txn.ID).SetMerchantID(foreign.ID).Exec(ctx)
			case "nonexpense":
				income := c.TransactionCategory.Create().SetHouseholdID(cat.HouseholdID).SetName("Merchant guard income").SetIcon("cash").SetType(transactioncategory.TypeIncome).SaveX(ctx)
				err = c.Transaction.UpdateOneID(txn.ID).SetCategoryID(income.ID).Exec(ctx)
			case "referenced deletion":
				err = c.Merchant.DeleteOneID(m.ID).Exec(ctx)
			case "category mutation":
				err = c.TransactionCategory.UpdateOneID(cat.ID).SetType(transactioncategory.TypeIncome).Exec(ctx)
			}
			if err == nil {
				t.Fatalf("database accepted %s", kind)
			}
		})
	}
}
func merchantGraphQL(t *testing.T, c *ent.Client, ctx context.Context, query string, variables map[string]any) string {
	t.Helper()
	api := handler.NewDefaultServer(NewExecutableSchema(Config{Resolvers: newMemberTestResolver(c)}))
	api.Use(entgql.Transactioner{TxOpener: c})
	body, err := json.Marshal(map[string]any{"query": query, "variables": variables})
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest("POST", "/query", strings.NewReader(string(body))).WithContext(ctx)
	req.Header.Set("Content-Type", "application/json")
	res := httptest.NewRecorder()
	api.ServeHTTP(res, req)
	return res.Body.String()
}
func TestMerchantPostgresFailedExpenseRollsBackNewMerchant(t *testing.T) {
	c, ctx, _ := snapshotPostgresClient(t)
	acc := c.Account.Query().Where(account.ArchivedEQ(false)).FirstX(ctx)
	cat := c.TransactionCategory.Create().SetHouseholdID(contextkeys.GetHouseholdID(ctx)).SetName("Rollback expense " + time.Now().Format("150405.000000000")).SetType(transactioncategory.TypeExpense).SetIcon("food").SaveX(ctx)
	t.Cleanup(func() { _ = c.TransactionCategory.DeleteOneID(cat.ID).Exec(ctx) })
	before := c.Merchant.Query().CountX(ctx)
	txns := c.Transaction.Query().CountX(ctx)
	body := merchantGraphQL(t, c, ctx, `mutation($input:CreateExpenseInputCustom!){createExpense(input:$input){node{id}}}`, map[string]any{"input": map[string]any{"merchantName": "Must roll back merchant", "transaction": map[string]any{"datetime": time.Now().Format(time.RFC3339), "categoryID": fmt.Sprint(cat.ID), "userID": fmt.Sprint(contextkeys.GetUserID(ctx))}, "transactionEntry": map[string]any{"accountID": fmt.Sprint(acc.ID), "amount": "20"}}})
	if !strings.Contains(body, "expense amount must be negative") {
		t.Fatal(body)
	}
	if c.Merchant.Query().CountX(ctx) != before || c.Transaction.Query().CountX(ctx) != txns {
		t.Fatal("failed expense left merchant/transaction")
	}
}
func TestMerchantPostgresFailedMergeRollsBackReassignment(t *testing.T) {
	c, ctx, _ := snapshotPostgresClient(t)
	r := &mutationResolver{newMemberTestResolver(c)}
	suffix := time.Now().Format("150405.000000000")
	source, err := r.CreateMerchant(ctx, "Rollback source "+suffix, nil)
	if err != nil {
		t.Fatal(err)
	}
	target, err := r.CreateMerchant(ctx, "Rollback target "+suffix, nil)
	if err != nil {
		t.Fatal(err)
	}
	cat := c.TransactionCategory.Create().SetHouseholdID(contextkeys.GetHouseholdID(ctx)).SetName("Rollback category " + suffix).SetType(transactioncategory.TypeExpense).SetIcon("food").SaveX(ctx)
	txn := c.Transaction.Create().SetHouseholdID(contextkeys.GetHouseholdID(ctx)).SetUserID(contextkeys.GetUserID(ctx)).SetCategoryID(cat.ID).SetDatetime(time.Now()).SaveX(ctx)
	t.Cleanup(func() {
		_ = c.Transaction.DeleteOneID(txn.ID).Exec(ctx)
		_ = c.TransactionCategory.DeleteOneID(cat.ID).Exec(ctx)
	})
	original := txn.MerchantID
	c.Transaction.UpdateOneID(txn.ID).SetMerchantID(source.ID).ExecX(ctx)
	t.Cleanup(func() {
		update := c.Transaction.UpdateOneID(txn.ID)
		if original == nil {
			update.ClearMerchant()
		} else {
			update.SetMerchantID(*original)
		}
		if err := update.Exec(ctx); err != nil {
			t.Error(err)
		}
		_, _ = c.Merchant.Delete().Where(merchant.IDIn(source.ID, target.ID)).Exec(ctx)
	})
	wrote := false
	c.Merchant.Use(func(next ent.Mutator) ent.Mutator {
		return ent.MutateFunc(func(ctx context.Context, m ent.Mutation) (ent.Value, error) {
			if m.Op().Is(ent.OpDeleteOne) {
				pending := ent.FromContext(ctx).Transaction.GetX(ctx, txn.ID)
				wrote = pending.MerchantID != nil && *pending.MerchantID == target.ID
				return nil, errors.New("injected merchant delete failure")
			}
			return next.Mutate(ctx, m)
		})
	})
	body := merchantGraphQL(t, c, ctx, `mutation($source:ID!,$target:ID!){mergeMerchant(sourceID:$source,targetID:$target){reassignedCount}}`, map[string]any{"source": fmt.Sprint(source.ID), "target": fmt.Sprint(target.ID)})
	if !wrote || !strings.Contains(body, "injected merchant delete failure") {
		t.Fatal(body)
	}
	stored := c.Transaction.GetX(ctx, txn.ID)
	if stored.MerchantID == nil || *stored.MerchantID != source.ID {
		t.Fatal("failed merge committed reassignment")
	}
	if !c.Merchant.Query().Where(merchant.IDEQ(source.ID)).ExistX(ctx) {
		t.Fatal("source missing")
	}
}
func TestMerchantPostgresConcurrentCreateReusesNormalizedName(t *testing.T) {
	c, ctx, userID := snapshotPostgresClient(t)
	name := "Concurrent merchant " + time.Now().Format("150405.000000000")
	_, key, _ := merchantNameKey(name)
	t.Cleanup(func() { _, _ = c.Merchant.Delete().Where(merchant.NameKeyEQ(key)).Exec(ctx) })
	const workers = 6
	start := make(chan struct{})
	results := make(chan error, workers)
	ids := make(chan int, workers)
	var wg sync.WaitGroup
	for i := range workers {
		wg.Go(func() {
			<-start
			tx, err := c.Tx(ctx)
			if err != nil {
				results <- err
				return
			}
			defer func() { _ = tx.Rollback() }()
			callctx, cancel := context.WithTimeout(memberCallCtx(tx.Client(), userID, contextkeys.GetHouseholdID(ctx)), 10*time.Second)
			defer cancel()
			r := &mutationResolver{newMemberTestResolver(tx.Client())}
			display := name
			if i%2 == 0 {
				display = "  " + strings.ToUpper(name) + "  "
			}
			m, err := r.CreateMerchant(callctx, display, nil)
			if err == nil {
				err = tx.Commit()
			}
			if err == nil {
				ids <- m.ID
			}
			results <- err
		})
	}
	close(start)
	wg.Wait()
	close(results)
	close(ids)
	for err := range results {
		if err != nil {
			t.Fatal(err)
		}
	}
	id := 0
	for next := range ids {
		if id != 0 && next != id {
			t.Fatal("duplicate merchants")
		}
		id = next
	}
	if c.Merchant.Query().Where(merchant.NameKeyEQ(key)).CountX(ctx) != 1 {
		t.Fatal("duplicate names stored")
	}
}

func TestMerchantPostgresConcurrentOppositeMergesKeepEveryAssignment(t *testing.T) {
	c, ctx, userID := snapshotPostgresClient(t)
	r := &mutationResolver{newMemberTestResolver(c)}
	suffix := time.Now().Format("150405.000000000")
	a, err := r.CreateMerchant(ctx, "Concurrent source "+suffix, nil)
	if err != nil {
		t.Fatal(err)
	}
	b, err := r.CreateMerchant(ctx, "Concurrent destination "+suffix, nil)
	if err != nil {
		t.Fatal(err)
	}
	cat := c.TransactionCategory.Create().SetHouseholdID(contextkeys.GetHouseholdID(ctx)).SetName("Concurrent merge " + suffix).SetType(transactioncategory.TypeExpense).SetIcon("food").SaveX(ctx)
	txnIDs := []int{}
	for _, id := range []int{a.ID, b.ID} {
		txn := c.Transaction.Create().SetHouseholdID(cat.HouseholdID).SetUserID(userID).SetCategoryID(cat.ID).SetDatetime(time.Now()).SetMerchantID(id).SaveX(ctx)
		txnIDs = append(txnIDs, txn.ID)
	}
	t.Cleanup(func() {
		for _, id := range txnIDs {
			_ = c.Transaction.DeleteOneID(id).Exec(ctx)
		}
		_ = c.TransactionCategory.DeleteOneID(cat.ID).Exec(ctx)
		_, _ = c.Merchant.Delete().Where(merchant.IDIn(a.ID, b.ID)).Exec(ctx)
	})
	start := make(chan struct{})
	results := make(chan error, 2)
	var wg sync.WaitGroup
	for _, pair := range [][2]int{{a.ID, b.ID}, {b.ID, a.ID}} {
		wg.Go(func() {
			<-start
			tx, err := c.Tx(ctx)
			if err != nil {
				results <- err
				return
			}
			defer func() { _ = tx.Rollback() }()
			callctx, cancel := context.WithTimeout(memberCallCtx(tx.Client(), userID, cat.HouseholdID), 10*time.Second)
			defer cancel()
			mr := &mutationResolver{newMemberTestResolver(tx.Client())}
			_, err = mr.MergeMerchant(callctx, pair[0], pair[1])
			if err == nil {
				err = tx.Commit()
			}
			results <- err
		})
	}
	close(start)
	wg.Wait()
	close(results)
	success := 0
	for err := range results {
		if err == nil {
			success++
		} else if !ent.IsNotFound(err) {
			t.Fatalf("unexpected concurrent error: %v", err)
		}
	}
	if success != 1 {
		t.Fatalf("successful merges=%d", success)
	}
	survivors := c.Merchant.Query().Where(merchant.IDIn(a.ID, b.ID)).AllX(ctx)
	if len(survivors) != 1 {
		t.Fatal("expected one surviving identity")
	}
	for _, id := range txnIDs {
		txn := c.Transaction.GetX(ctx, id)
		if txn.MerchantID == nil || *txn.MerchantID != survivors[0].ID {
			t.Fatal("assignment lost during concurrent merge")
		}
	}
}
