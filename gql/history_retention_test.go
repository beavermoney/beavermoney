package gql

import (
	"testing"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/investment"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/internal/contextkeys"
	"github.com/shopspring/decimal"
)

func TestDeleteCurrencyPreservesEveryHistoricalReference(t *testing.T) {
	for _, kind := range []string{"active account", "archived account", "archived holding", "legacy totals", "outgoing saved rate", "incoming saved rate", "inactive subscription", "default currency"} {
		t.Run(kind, func(t *testing.T) {
			f := setupMemberFixture(t)
			ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
			c := f.client
			hc := c.HouseholdCurrency.Create().SetHouseholdID(f.household.ID).SetCode("CAD").SaveX(ctx)
			switch kind {
			case "active account", "archived account":
				c.Account.Create().SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(hc.ID).SetName(kind).SetType(account.TypeLiquidity).SetArchived(kind == "archived account").SaveX(ctx)
			case "archived holding":
				a := c.Account.Create().SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetName("Broker").SetType(account.TypeInvestment).SaveX(ctx)
				c.Investment.Create().SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetAccountID(a.ID).SetHouseholdCurrencyID(hc.ID).SetName("Retired").SetType(investment.TypeStock).SetSymbol("TEST").SetQuote(decimal.NewFromInt(1)).SetArchived(true).SaveX(ctx)
			case "legacy totals":
				s := c.Snapshot.Create().SetHouseholdID(f.household.ID).SaveX(ctx)
				c.SnapshotEntry.Create().SetHouseholdID(f.household.ID).SetSnapshotID(s.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(hc.ID).SetLiquidity(decimal.NewFromInt(100)).SetInvestment(decimal.Zero).SetProperty(decimal.Zero).SetReceivable(decimal.Zero).SetLiability(decimal.Zero).SaveX(ctx)
			case "outgoing saved rate", "incoming saved rate":
				s := c.Snapshot.Create().SetHouseholdID(f.household.ID).SetFormatVersion(1).SaveX(ctx)
				from, to := hc.ID, f.primaryCurrency.ID
				if kind == "incoming saved rate" {
					from, to = to, from
				}
				c.SnapshotRate.Create().SetHouseholdID(f.household.ID).SetSnapshotID(s.ID).SetFromCurrencyID(from).SetToCurrencyID(to).SetRate(decimal.RequireFromString("1.37")).SaveX(ctx)
			case "inactive subscription":
				c.RecurringSubscription.Create().SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(hc.ID).SetName("Past subscription").SetInterval("month").SetStartDate(time.Now()).SetActive(false).SaveX(ctx)
			case "default currency":
				c.UserHousehold.UpdateOneID(f.adminUH.ID).SetHouseholdCurrencyID(hc.ID).SaveX(ctx)
			}
			ratesBefore := c.SnapshotRate.Query().CountX(ctx)
			mr := &mutationResolver{Resolver: newMemberTestResolver(c)}
			if _, err := mr.DeleteHouseholdCurrency(ctx, hc.ID); err == nil {
				t.Fatal("historically referenced currency deleted")
			}
			if _, err := c.HouseholdCurrency.Get(ctx, hc.ID); err != nil {
				t.Fatal("blocked deletion removed currency")
			}
			if n := c.SnapshotRate.Query().CountX(ctx); n != ratesBefore {
				t.Fatal("blocked deletion erased historical FX")
			}
		})
	}
}

func TestDeleteCurrencyAllowsUnusedCurrencyAndProtectsForeignHouseholds(t *testing.T) {
	f := setupMemberFixture(t)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	hc := f.client.HouseholdCurrency.Create().SetHouseholdID(f.household.ID).SetCode("CAD").SaveX(ctx)
	f.client.HouseholdRate.Create().SetHouseholdID(f.household.ID).SetFromCurrencyID(hc.ID).SetToCurrencyID(f.primaryCurrency.ID).SetRate(decimal.NewFromInt(1)).SaveX(ctx)
	mr := &mutationResolver{Resolver: newMemberTestResolver(f.client)}
	if _, err := mr.DeleteHouseholdCurrency(ctx, f.otherCurrency.ID); err == nil {
		t.Fatal("cross-household currency deleted")
	}
	if _, err := mr.DeleteHouseholdCurrency(ctx, hc.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := f.client.HouseholdCurrency.Get(ctx, hc.ID); !ent.IsNotFound(err) {
		t.Fatalf("unused currency retained: %v", err)
	}
	if n := f.client.HouseholdRate.Query().CountX(ctx); n != 0 {
		t.Fatal("orphan current FX rates")
	}
	if _, err := mr.DeleteHouseholdCurrency(ctx, f.primaryCurrency.ID); err == nil {
		t.Fatal("last household currency deleted")
	}
}

func TestMemberRemovalPreservesArchivedAndHistoricalContributions(t *testing.T) {
	for _, owner := range []string{"member", "joint"} {
		for _, kind := range []string{"archived account", "transaction", "legacy snapshot", "inactive subscription"} {
			t.Run(owner+"/"+kind, func(t *testing.T) {
				f := setupMemberFixture(t)
				pair := pairHouseholdWithMember(t, f)
				ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
				c := f.client
				id := f.memberUser.ID
				if owner == "joint" {
					id = pair.syntheticUser.ID
				}
				switch kind {
				case "archived account":
					c.Account.Create().SetHouseholdID(f.household.ID).SetUserID(id).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetName("Closed account").SetType(account.TypeLiquidity).SetArchived(true).SaveX(ctx)
				case "transaction":
					category := c.TransactionCategory.Create().SetHouseholdID(f.household.ID).SetName("Past income").SetType(transactioncategory.TypeIncome).SetIcon("plus").SaveX(ctx)
					c.Transaction.Create().SetHouseholdID(f.household.ID).SetUserID(id).SetCategoryID(category.ID).SetDatetime(time.Now()).SaveX(ctx)
				case "legacy snapshot":
					s := c.Snapshot.Create().SetHouseholdID(f.household.ID).SaveX(ctx)
					c.SnapshotEntry.Create().SetHouseholdID(f.household.ID).SetSnapshotID(s.ID).SetUserID(id).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetLiquidity(decimal.NewFromInt(100)).SetInvestment(decimal.Zero).SetProperty(decimal.Zero).SetReceivable(decimal.Zero).SetLiability(decimal.Zero).SaveX(ctx)
				case "inactive subscription":
					c.RecurringSubscription.Create().SetHouseholdID(f.household.ID).SetUserID(id).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetName("Past subscription").SetInterval("month").SetStartDate(time.Now()).SetActive(false).SaveX(ctx)
				}
				mr := &mutationResolver{Resolver: newMemberTestResolver(c)}
				_, err := mr.RemoveHouseholdUser(ctx, pair.memberUH.ID)
				requireErrorContains(t, err, "MEMBER_HAS_OWNED_RECORDS")
				if _, err := c.UserHousehold.Get(ctx, pair.memberUH.ID); err != nil {
					t.Fatal("blocked removal removed member")
				}
				if _, err := c.UserHousehold.Get(ctx, pair.syntheticUH.ID); err != nil {
					t.Fatal("blocked removal removed joint owner")
				}
			})
		}
	}
}

func TestReviewOfPreviouslyRemovedOwnerKeepsFinancialHistoryPrivateAndReadable(t *testing.T) {
	f := setupMemberFixture(t)
	pair := pairHouseholdWithMember(t, f)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	c := f.client
	a := c.Account.Create().SetHouseholdID(f.household.ID).SetUserID(f.memberUser.ID).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetName("Old account").SetType(account.TypeLiquidity).SetArchived(true).SaveX(ctx)
	c.SnapshotAccount.Create().SetHouseholdID(f.household.ID).SetAccountID(a.ID).SetCreateTime(time.Now()).SetBalance(decimal.NewFromInt(125)).SetArchived(false).SaveX(ctx)
	// Reproduce an old release's allowed removal, bypassing the new resolver guard.
	if err := c.UserHousehold.DeleteOneID(pair.memberUH.ID).Exec(contextkeys.NewPrivacyBypassContext(ctx)); err != nil {
		t.Fatal(err)
	}
	observations := c.SnapshotAccount.Query().WithAccount(func(q *ent.AccountQuery) { q.WithUser().WithHouseholdCurrency() }).AllX(ctx)
	if observations[0].Edges.Account.Edges.User != nil {
		t.Fatal("former member's private user record unexpectedly exposed")
	}
	doc, err := buildSnapshotReview(observations, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	got := doc.Accounts[0]
	if got.OwnerID != f.memberUser.ID || got.OwnerName != "" || got.Value != "125" {
		t.Fatalf("lost financial identity or exposed owner: %+v", got)
	}
	if _, err := captureReview([]*ent.Account{observations[0].Edges.Account}); err != nil {
		t.Fatal(err)
	}
}
