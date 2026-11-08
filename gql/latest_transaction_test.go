package gql

import (
	"context"
	"testing"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/investment"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/internal/contextkeys"
	"github.com/shopspring/decimal"
)

func TestLatestTransactionResolvers(t *testing.T) {
	r, client, bypass := newTestResolver(t)
	householdID, userID, _ := seedHouseholdWithUsers(t, client, bypass)
	ctx := context.WithValue(bypass, contextkeys.HouseholdIDKey(), householdID)
	ctx = ent.NewContext(ctx, client)
	currency := client.HouseholdCurrency.Query().OnlyX(ctx)

	usedAccount := client.Account.Create().
		SetName("Used").SetType(account.TypeLiquidity).SetUserID(userID).
		SetHouseholdID(householdID).SetHouseholdCurrencyID(currency.ID).SaveX(ctx)
	unusedAccount := client.Account.Create().
		SetName("Unused").SetType(account.TypeLiquidity).SetUserID(userID).
		SetHouseholdID(householdID).SetHouseholdCurrencyID(currency.ID).SaveX(ctx)
	usedInvestment := client.Investment.Create().
		SetName("Fund").SetType(investment.TypeStock).SetSymbol("FUND").
		SetAccountID(usedAccount.ID).SetUserID(userID).SetHouseholdID(householdID).
		SetHouseholdCurrencyID(currency.ID).SetQuote(decimal.NewFromInt(1)).SaveX(ctx)
	unusedInvestment := client.Investment.Create().
		SetName("Unused fund").SetType(investment.TypeStock).SetSymbol("NONE").
		SetAccountID(unusedAccount.ID).SetUserID(userID).SetHouseholdID(householdID).
		SetHouseholdCurrencyID(currency.ID).SetQuote(decimal.NewFromInt(1)).SaveX(ctx)
	category := client.TransactionCategory.Create().SetName("Test").SetIcon("test").
		SetType(transactioncategory.TypeIncome).SetHouseholdID(householdID).SaveX(ctx)
	unusedCategory := client.TransactionCategory.Create().SetName("Unused").SetIcon("test").
		SetType(transactioncategory.TypeIncome).SetHouseholdID(householdID).SaveX(ctx)

	older := client.Transaction.Create().SetHouseholdID(householdID).SetUserID(userID).
		SetCategoryID(category.ID).SetDescription("Cash").SetDatetime(time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)).SaveX(ctx)
	client.TransactionEntry.Create().SetHouseholdID(householdID).SetTransactionID(older.ID).
		SetAccountID(usedAccount.ID).SetAmount(decimal.NewFromInt(1)).SaveX(ctx)
	newer := client.Transaction.Create().SetHouseholdID(householdID).SetUserID(userID).
		SetCategoryID(category.ID).SetDescription("Buy").SetDatetime(time.Date(2026, 2, 1, 0, 0, 0, 0, time.UTC)).SaveX(ctx)
	client.InvestmentLot.Create().SetHouseholdID(householdID).SetTransactionID(newer.ID).
		SetInvestmentID(usedInvestment.ID).SetAmount(decimal.NewFromInt(1)).SetPrice(decimal.NewFromInt(1)).SaveX(ctx)
	queryCtx := context.WithValue(context.Background(), contextkeys.HouseholdIDKey(), householdID)
	queryCtx = ent.NewContext(queryCtx, client)

	accountResolver := &accountResolver{r}
	latest, err := accountResolver.LatestTransaction(queryCtx, usedAccount)
	if err != nil || latest == nil || latest.ID != newer.ID {
		t.Fatalf("used account latest = %#v, err = %v; want transaction %d", latest, err, newer.ID)
	}
	latest, err = accountResolver.LatestTransaction(queryCtx, unusedAccount)
	if err != nil || latest != nil {
		t.Fatalf("unused account latest = %#v, err = %v; want nil", latest, err)
	}

	investmentResolver := &investmentResolver{r}
	latest, err = investmentResolver.LatestTransaction(queryCtx, usedInvestment)
	if err != nil || latest == nil || latest.ID != newer.ID {
		t.Fatalf("used investment latest = %#v, err = %v; want transaction %d", latest, err, newer.ID)
	}
	latest, err = investmentResolver.LatestTransaction(queryCtx, unusedInvestment)
	if err != nil || latest != nil {
		t.Fatalf("unused investment latest = %#v, err = %v; want nil", latest, err)
	}

	categoryResolver := &transactionCategoryResolver{r}
	latest, err = categoryResolver.LatestTransaction(queryCtx, category)
	if err != nil || latest == nil || latest.ID != newer.ID {
		t.Fatalf("used category latest = %#v, err = %v; want transaction %d", latest, err, newer.ID)
	}
	latest, err = categoryResolver.LatestTransaction(queryCtx, unusedCategory)
	if err != nil || latest != nil {
		t.Fatalf("unused category latest = %#v, err = %v; want nil", latest, err)
	}
}
