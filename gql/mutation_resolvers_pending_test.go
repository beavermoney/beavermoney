package gql

import (
	"testing"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/gql/model"
	"github.com/shopspring/decimal"
)

func TestTransactionPendingLifecycle(t *testing.T) {
	f := setupMemberFixture(t)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	mr := &mutationResolver{Resolver: newMemberTestResolver(f.client)}
	acc := f.client.Account.Create().SetName("Checking").SetType(account.TypeLiquidity).
		SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).
		SetHouseholdCurrencyID(f.primaryCurrency.ID).SaveX(ctx)
	category := f.client.TransactionCategory.Create().SetName("Food").SetIcon("utensils").
		SetType(transactioncategory.TypeExpense).SetHouseholdID(f.household.ID).SaveX(ctx)
	for _, initial := range []*bool{nil, new(true), new(false)} {
		result, err := mr.CreateExpense(ctx, model.CreateExpenseInputCustom{
			Transaction: &ent.CreateTransactionInput{
				Datetime: time.Now(), UserID: f.adminUser.ID, CategoryID: category.ID, Pending: initial,
			},
			TransactionEntry: &ent.CreateTransactionEntryInput{
				Amount: decimal.NewFromInt(-20), AccountID: acc.ID,
			},
		})
		if err != nil {
			t.Fatal(err)
		}
		id := result.Node.ID
		want := initial != nil && *initial
		stored := f.client.Transaction.GetX(ctx, id)
		if stored.Pending != want || stored.ExcludeFromReports {
			t.Fatalf("pending default/create = %v, excluded = %v", stored.Pending, stored.ExcludeFromReports)
		}
		// An omitted field must retain the existing value.
		description := "Updated note"
		if _, err := mr.UpdateTransaction(ctx, id, ent.UpdateTransactionInput{Description: &description}); err != nil {
			t.Fatal(err)
		}
		if f.client.Transaction.GetX(ctx, id).Pending != want {
			t.Fatal("note edit changed pending")
		}
		for _, pending := range []bool{true, false} {
			if _, err := mr.UpdateTransaction(ctx, id, ent.UpdateTransactionInput{Pending: &pending}); err != nil {
				t.Fatal(err)
			}
			stored = f.client.Transaction.GetX(ctx, id)
			if stored.Pending != pending || stored.ExcludeFromReports {
				t.Fatal("pending was not persisted independently")
			}
			entries := stored.QueryTransactionEntries().AllX(ctx)
			if len(entries) != 1 || !entries[0].Amount.Equal(decimal.NewFromInt(-20)) {
				t.Fatal("pending changed money movement")
			}
		}
		otherCtx := memberCallCtx(f.client, f.adminUser.ID, f.otherHousehold.ID)
		if _, err := mr.UpdateTransaction(otherCtx, id, ent.UpdateTransactionInput{Pending: new(true)}); err == nil {
			t.Fatal("pending update allowed access across households")
		}
	}
}
