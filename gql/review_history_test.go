package gql

import (
	"beavermoney.app/ent"
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/investment"
	"beavermoney.app/ent/transactioncategory"
	"github.com/shopspring/decimal"
	"testing"
	"time"
)

func TestAverageReviewFreshness(t *testing.T) {
	now := time.Now()
	before := now.Add(-time.Hour)
	later := now.Add(time.Hour)
	average := "123.45"
	cases := []struct {
		name               string
		confirmed, changed *time.Time
		amount             string
		want               bool
	}{
		{"missing confirmation", nil, nil, "10", true},
		{"confirmed after changes", &now, &before, "10", false},
		{"backdated edit detected by modification time", &now, &later, "10", true},
		{"equal timestamps remain unconfirmed", &now, &now, "10", true},
		{"closed position", nil, &later, "0", false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			inv := &ent.Investment{Amount: decimal.RequireFromString(c.amount), ConfirmedAverageCost: &average, AverageCostConfirmedAt: c.confirmed, HoldingsChangedAt: c.changed}
			if got := averageNeedsReview(inv); got != c.want {
				t.Fatalf("got %v want %v", got, c.want)
			}
		})
	}
}

func TestManualAverageConfirmationRejectsStaleAndForeignHoldings(t *testing.T) {
	f := setupMemberFixture(t)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	acc := f.client.Account.Create().SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetName("Broker").SetType(account.TypeInvestment).SaveX(ctx)
	inv := f.client.Investment.Create().SetHouseholdID(f.household.ID).SetAccountID(acc.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetName("Shares").SetSymbol("AAPL").SetType(investment.TypeStock).SetAmount(decimal.NewFromInt(10)).SetQuote(decimal.NewFromInt(12)).SaveX(ctx)
	confirmed, err := confirmAverage(ctx, f.client, inv.ID, "5.125", "10", nil)
	if err != nil || averageNeedsReview(confirmed) {
		t.Fatalf("confirmation failed: %v", err)
	}
	r := &investmentResolver{Resolver: newMemberTestResolver(f.client)}
	basis, err := r.CostBasis(ctx, confirmed)
	if err != nil || basis == nil || *basis != "51.25" {
		t.Fatalf("basis = %v, err %v", basis, err)
	}
	changed := time.Now().Add(time.Second)
	f.client.Investment.UpdateOneID(inv.ID).SetHoldingsChangedAt(changed).SaveX(ctx)
	if _, err := confirmAverage(ctx, f.client, inv.ID, "6", "10", nil); err == nil {
		t.Fatal("stale version accepted")
	}
	if _, err := confirmAverage(ctx, f.client, inv.ID, "6", "11", &changed); err == nil {
		t.Fatal("stale quantity accepted")
	}
	for _, bad := range []string{"-1", "NaN", "1e1000000000", "", "1.1234567891234567891"} {
		if _, err := confirmAverage(ctx, f.client, inv.ID, bad, "10", &changed); err == nil {
			t.Fatalf("invalid average accepted: %s", bad)
		}
	}
	foreign := memberCallCtx(f.client, f.adminUser.ID, f.otherHousehold.ID)
	if _, err := confirmAverage(foreign, f.client, inv.ID, "6", "10", &changed); err == nil {
		t.Fatal("cross-household confirmation accepted")
	}
	if basis, err := r.CostBasis(ctx, f.client.Investment.GetX(ctx, inv.ID)); err != nil || basis != nil {
		t.Fatal("unconfirmed basis should be unavailable")
	}
}

func TestClosedHoldingAndInvalidExpectedQuantity(t *testing.T) {
	f := setupMemberFixture(t)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	r := &investmentResolver{Resolver: newMemberTestResolver(f.client)}
	closed := &ent.Investment{Amount: decimal.Zero, Value: decimal.Zero}
	basis, err := r.CostBasis(ctx, closed)
	if err != nil || basis == nil || *basis != "0" {
		t.Fatalf("closed basis %v, %v", basis, err)
	}
	gain, err := r.UnrealizedReturn(ctx, closed)
	if err != nil || gain == nil || *gain != "0" {
		t.Fatalf("closed unrealized return %v, %v", gain, err)
	}
	percent, err := r.UnrealizedReturnPercent(ctx, closed)
	if err != nil || percent != nil {
		t.Fatalf("zero basis percent %v, %v", percent, err)
	}
	for _, amount := range []string{"1e999999999", "NaN", "9999999999999999999", "0.1234567890123456789"} {
		if _, err := confirmAverage(ctx, f.client, 0, "1", amount, nil); err == nil {
			t.Fatalf("invalid quantity accepted: %s", amount)
		}
	}
}

func TestShareTransferEditKeepsBothSidesBalancedWithoutPrices(t *testing.T) {
	f := setupMemberFixture(t)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	mr := &mutationResolver{Resolver: newMemberTestResolver(f.client)}
	createHolding := func(name, symbol string, amount int64) *ent.Investment {
		acc := f.client.Account.Create().SetName(name).SetType(account.TypeInvestment).SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(f.primaryCurrency.ID).SaveX(ctx)
		return f.client.Investment.Create().SetName(symbol).SetSymbol(symbol).SetType(investment.TypeStock).SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetAccountID(acc.ID).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetAmount(decimal.NewFromInt(amount)).SetQuote(decimal.NewFromInt(10)).SaveX(ctx)
	}
	from, to := createHolding("Source", "AAPL", 8), createHolding("Destination", "AAPL", 2)
	category := f.client.TransactionCategory.Create().SetName("Move").SetType(transactioncategory.TypeInvestment).SetIcon("arrow-right").SetHouseholdID(f.household.ID).SaveX(ctx)
	txn := f.client.Transaction.Create().SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetCategoryID(category.ID).SetDatetime(time.Now()).SaveX(ctx)
	makeLot := func(id int, amount int64) *ent.InvestmentLot {
		return f.client.InvestmentLot.Create().SetHouseholdID(f.household.ID).SetInvestmentID(id).SetTransactionID(txn.ID).SetAmount(decimal.NewFromInt(amount)).SetPrice(decimal.NewFromInt(99)).SaveX(ctx)
	}
	out, in := makeLot(from.ID, -2), makeLot(to.ID, 2)
	amount, price := decimal.NewFromInt(-3), decimal.NewFromInt(500)
	if _, err := mr.UpdateInvestmentLot(ctx, out.ID, ent.UpdateInvestmentLotInput{Amount: &amount, Price: &price}); err != nil {
		t.Fatal(err)
	}
	updatedOut, updatedIn := f.client.InvestmentLot.GetX(ctx, out.ID), f.client.InvestmentLot.GetX(ctx, in.ID)
	if !updatedOut.Amount.Add(updatedIn.Amount).IsZero() || !updatedIn.Amount.Equal(decimal.NewFromInt(3)) || !updatedOut.Price.IsZero() || !updatedIn.Price.IsZero() {
		t.Fatal("transfer edit changed share conservation or recorded a price")
	}
	for _, invalid := range []int64{0, 1, -1000} {
		amount := decimal.NewFromInt(invalid)
		if _, err := mr.UpdateInvestmentLot(ctx, out.ID, ent.UpdateInvestmentLotInput{Amount: &amount}); err == nil {
			t.Fatalf("invalid transfer quantity accepted: %d", invalid)
		}
	}
	different := createHolding("Different security", "MSFT", 10)
	if _, err := mr.UpdateInvestmentLot(ctx, out.ID, ent.UpdateInvestmentLotInput{InvestmentID: &different.ID}); err == nil {
		t.Fatal("mismatched security accepted")
	}
}

func TestManualAverageConfirmationIsLaterThanDatabaseClockAndStillRejectsStaleState(t *testing.T) {
	f := setupMemberFixture(t)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	a := f.client.Account.Create().SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetName("Broker").SetType(account.TypeInvestment).SaveX(ctx)
	changed := time.Now().UTC().Add(time.Hour).Truncate(time.Microsecond)
	inv := f.client.Investment.Create().SetHouseholdID(f.household.ID).SetAccountID(a.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetName("Shares").SetSymbol("CLOCK").SetType(investment.TypeStock).SetAmount(decimal.NewFromInt(10)).SetQuote(decimal.NewFromInt(12)).SetHoldingsChangedAt(changed).SaveX(ctx)
	confirmed, err := confirmAverage(ctx, f.client, inv.ID, "7.125", inv.Amount.String(), &changed)
	if err != nil {
		t.Fatal(err)
	}
	if confirmed.AverageCostConfirmedAt == nil || !confirmed.AverageCostConfirmedAt.After(changed) || averageNeedsReview(confirmed) {
		t.Fatal("successful confirmation remained stale when database time was ahead")
	}
	if confirmed.AverageCostConfirmedAt.Nanosecond()%1000 != 0 {
		t.Fatal("confirmation is not representable at PostgreSQL timestamp precision")
	}
	later := changed.Add(time.Second)
	f.client.Investment.UpdateOneID(inv.ID).SetHoldingsChangedAt(later).SaveX(ctx)
	if _, err := confirmAverage(ctx, f.client, inv.ID, "8", inv.Amount.String(), &changed); err == nil {
		t.Fatal("monotonic timestamp bypassed the stale-state guard")
	}
	stale := f.client.Investment.GetX(ctx, inv.ID)
	if stale.ConfirmedAverageCost == nil || *stale.ConfirmedAverageCost != "7.125" || !averageNeedsReview(stale) {
		t.Fatal("rejected confirmation overwrote the last reviewed average")
	}
}
