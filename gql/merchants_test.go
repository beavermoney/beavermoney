package gql

import (
	"context"
	"strings"
	"testing"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/merchant"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/gql/model"
	"beavermoney.app/internal/contextkeys"
	"github.com/shopspring/decimal"
)

func TestMerchantExpenseLifecycleAndPrivacy(t *testing.T) {
	f := setupMemberFixture(t)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	c := f.client
	mr := &mutationResolver{newMemberTestResolver(c)}
	acc := c.Account.Create().SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetType(account.TypeLiquidity).SetName("Cash").SaveX(ctx)
	category := c.TransactionCategory.Create().SetHouseholdID(f.household.ID).SetType(transactioncategory.TypeExpense).SetName("Food").SetIcon("food").SaveX(ctx)
	income := c.TransactionCategory.Create().SetHouseholdID(f.household.ID).SetType(transactioncategory.TypeIncome).SetName("Salary").SetIcon("salary").SaveX(ctx)
	name := "  CAFÉ\tStore  "
	result, err := mr.CreateExpense(ctx, model.CreateExpenseInputCustom{Transaction: &ent.CreateTransactionInput{Datetime: time.Now(), UserID: f.adminUser.ID, CategoryID: category.ID}, TransactionEntry: &ent.CreateTransactionEntryInput{AccountID: acc.ID, Amount: decimal.NewFromInt(-12)}, MerchantName: &name})
	if err != nil {
		t.Fatal(err)
	}
	first := c.Transaction.GetX(ctx, result.Node.ID)
	if first.MerchantID == nil {
		t.Fatal("merchant missing")
	}
	m := c.Merchant.GetX(ctx, *first.MerchantID)
	if m.Name != "CAFÉ Store" {
		t.Fatal(m.Name)
	}
	existing, err := mr.CreateMerchant(ctx, "cafe\u0301 store", nil)
	if err != nil || existing.ID != m.ID {
		t.Fatalf("normalized name not reused: %v %v", existing, err)
	}
	replacement := "Second"
	updated, err := mr.UpdateTransaction(ctx, first.ID, ent.UpdateTransactionInput{}, &replacement)
	if err != nil || updated.Node.MerchantID == nil || *updated.Node.MerchantID == m.ID {
		t.Fatalf("new name edit: %v", err)
	}
	if _, err := mr.UpdateTransaction(ctx, first.ID, ent.UpdateTransactionInput{ClearMerchant: true}, nil); err != nil {
		t.Fatal(err)
	}
	if c.Transaction.GetX(ctx, first.ID).MerchantID != nil {
		t.Fatal("clear failed")
	}
	if _, err := mr.UpdateTransaction(ctx, first.ID, ent.UpdateTransactionInput{MerchantID: &m.ID}, nil); err != nil {
		t.Fatal(err)
	}
	if _, err := mr.UpdateTransaction(ctx, first.ID, ent.UpdateTransactionInput{CategoryID: &income.ID}, nil); err != nil {
		t.Fatal(err)
	}
	if c.Transaction.GetX(ctx, first.ID).MerchantID != nil {
		t.Fatal("nonexpense retained merchant")
	}
	if _, err := mr.UpdateTransaction(ctx, first.ID, ent.UpdateTransactionInput{MerchantID: &m.ID}, nil); err == nil {
		t.Fatal("nonexpense assignment allowed")
	}
	other := memberCallCtx(c, f.adminUser.ID, f.otherHousehold.ID)
	if _, err := c.Merchant.Get(other, m.ID); err == nil {
		t.Fatal("crosshousehold read")
	}
	if _, err := mr.UpdateMerchant(other, m.ID, &name, nil, nil); err == nil {
		t.Fatal("crosshousehold update")
	}
	if _, err := mr.MergeMerchant(other, m.ID, existing.ID+1); err == nil {
		t.Fatal("crosshousehold merge")
	}
	if _, _, err := merchantNameKey(strings.Repeat("店", 120)); err != nil {
		t.Fatal(err)
	}
	if _, _, err := merchantNameKey(strings.Repeat("店", 121)); err == nil {
		t.Fatal("oversized name allowed")
	}
}

func TestMerchantInsightsExactCurrencyOwnerAndUnassigned(t *testing.T) {
	f := setupMemberFixture(t)
	pairHouseholdWithMember(t, f)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	c := f.client
	r := newMemberTestResolver(c)
	mr := &mutationResolver{r}
	ctx = context.WithValue(ctx, contextkeys.DisplayCurrencyKey(), &contextkeys.DisplayCurrency{HouseholdCurrencyID: f.primaryCurrency.ID, Code: f.primaryCurrency.Code})
	m, err := mr.CreateMerchant(ctx, "Store", nil)
	if err != nil {
		t.Fatal(err)
	}
	unused, err := mr.CreateMerchant(ctx, "Unused", nil)
	if err != nil {
		t.Fatal(err)
	}
	cad := c.HouseholdCurrency.Create().SetHouseholdID(f.household.ID).SetCode("CAD").SaveX(ctx)
	c.HouseholdRate.Create().SetHouseholdID(f.household.ID).SetFromCurrencyID(cad.ID).SetToCurrencyID(f.primaryCurrency.ID).SetRate(decimal.RequireFromString("0.73")).SaveX(ctx)
	a := c.Account.Create().SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetHouseholdCurrencyID(f.primaryCurrency.ID).SetName("A").SetType(account.TypeLiquidity).SaveX(ctx)
	b := c.Account.Create().SetHouseholdID(f.household.ID).SetUserID(f.memberUser.ID).SetHouseholdCurrencyID(cad.ID).SetName("B").SetType(account.TypeLiquidity).SaveX(ctx)
	cat := c.TransactionCategory.Create().SetHouseholdID(f.household.ID).SetType(transactioncategory.TypeExpense).SetName("Food").SetIcon("food").SaveX(ctx)
	add := func(date string, mid *int, pending, excluded bool, amountA, amountB string) {
		when, err := time.Parse(time.RFC3339, date)
		if err != nil {
			t.Fatal(err)
		}
		txn := c.Transaction.Create().SetHouseholdID(f.household.ID).SetUserID(f.adminUser.ID).SetCategoryID(cat.ID).SetDatetime(when).SetNillableMerchantID(mid).SetPending(pending).SetExcludeFromReports(excluded).SaveX(ctx)
		for i, amount := range []string{amountA, amountB} {
			if amount == "" {
				continue
			}
			acc := a
			if i == 1 {
				acc = b
			}
			c.TransactionEntry.Create().SetHouseholdID(f.household.ID).SetTransactionID(txn.ID).SetAccountID(acc.ID).SetAmount(decimal.RequireFromString(amount)).SaveX(ctx)
		}
	}
	add("2026-01-15T12:00:00Z", &m.ID, false, false, "-10.01", "-5.23")
	add("2026-01-20T12:00:00Z", &m.ID, true, false, "-2", "")
	add("2026-01-22T12:00:00Z", nil, false, false, "-3", "")
	add("2025-12-20T12:00:00Z", &m.ID, false, false, "-7", "")
	add("2026-01-23T12:00:00Z", &m.ID, false, true, "-999", "")
	period := model.TimePeriodInput{StartDate: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC), EndDate: time.Date(2026, 2, 1, 0, 0, 0, 0, time.UTC)}
	overview, err := r.merchantOverview(ctx, f.household.ID, period, nil)
	if err != nil {
		t.Fatal(err)
	}
	if overview.Total.Total != "18.8279" || overview.Total.TransactionCount != 3 || overview.Unassigned.Total != "3" {
		t.Fatalf("overview %#v / %#v", overview.Total, overview.Unassigned)
	}
	if len(overview.Merchants) != 2 || overview.Merchants[1].Merchant.ID != unused.ID || overview.Merchants[1].Summary.Total != "0" {
		t.Fatal("missing empty merchant")
	}
	detail, err := r.merchantDetail(ctx, m, period, []int{f.memberUser.ID})
	if err != nil {
		t.Fatal(err)
	}
	if decimal.RequireFromString(detail.Period.Total).Round(12).String() != "3.8179" || detail.Period.TransactionCount != 1 || decimal.RequireFromString(detail.Lifetime.Total).Round(12).String() != "3.8179" {
		t.Fatalf("member scope period=%+v lifetime=%+v", detail.Period, detail.Lifetime)
	}
	detail, err = r.merchantDetail(ctx, m, period, nil)
	if err != nil {
		t.Fatal(err)
	}
	if decimal.RequireFromString(detail.Lifetime.Total).Round(12).String() != "22.8279" || detail.Period.TransactionCount != 2 || len(detail.Categories) != 1 || len(detail.Monthly) != 1 || detail.Monthly[0].Month != "2026-01" {
		t.Fatalf("detail %#v", detail)
	}
	if _, err := r.merchantDetail(ctx, m, period, []int{f.nonMemberUser.ID}); err == nil {
		t.Fatal("foreign member scope")
	}
	matches, err := r.searchMerchants(ctx, f.household.ID, "sto", new(20))
	if err != nil || len(matches) != 1 || matches[0].ID != m.ID {
		t.Fatalf("search %v %v", matches, err)
	}
	if _, err := c.HouseholdRate.Delete().Exec(ctx); err != nil {
		t.Fatal(err)
	}
	if _, err := r.merchantDetail(ctx, m, period, nil); err == nil || !strings.Contains(err.Error(), "exchange rate unavailable") {
		t.Fatalf("missing FX: %v", err)
	}
	if n := c.Merchant.Query().Where(merchant.NameKeyEQ("unused")).CountX(ctx); n != 1 {
		t.Fatal(n)
	}
}

func TestMerchantDomainIconLifecycle(t *testing.T) {
	f := setupMemberFixture(t)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	r := &mutationResolver{newMemberTestResolver(f.client)}
	icon := "  WWW.Example.COM  "
	m, err := r.CreateMerchant(ctx, "Domain store", &icon)
	if err != nil {
		t.Fatal(err)
	}
	if m.Icon == nil || *m.Icon != "www.example.com" {
		t.Fatalf("domain not normalized: %+v", m.Icon)
	}
	name := "Renamed domain store"
	m, err = r.UpdateMerchant(ctx, m.ID, &name, nil, nil)
	if err != nil || m.Icon == nil || *m.Icon != "www.example.com" {
		t.Fatalf("rename changed icon: %v", err)
	}
	replacement := "shop.example.ca"
	m, err = r.UpdateMerchant(ctx, m.ID, nil, &replacement, nil)
	if err != nil || m.Icon == nil || *m.Icon != replacement {
		t.Fatalf("replace domain: %v", err)
	}
	if _, err := r.UpdateMerchant(ctx, m.ID, nil, &replacement, new(true)); err == nil {
		t.Fatal("ambiguous clear/set accepted")
	}
	if _, err := r.CreateMerchant(ctx, name, &icon); err == nil {
		t.Fatal("duplicate name silently ignored icon")
	}
	m, err = r.UpdateMerchant(ctx, m.ID, nil, nil, new(true))
	if err != nil || m.Icon != nil {
		t.Fatalf("clear domain: %v", err)
	}
	for _, value := range []string{"", "https://example.com", "example.com/path", "example.com:443", "localhost", "127.0.0.1", "[::1]", "-bad.example", "bad-.example", "bad..example", "exam ple.com", "example.com?x=1", strings.Repeat("a", 64) + ".com", strings.Repeat("a.", 126) + "com"} {
		if _, err := merchantIconDomain(value); err == nil {
			t.Errorf("accepted invalid domain %q", value)
		}
	}
	before := f.client.Merchant.Query().CountX(ctx)
	bad := "https://example.com"
	if _, err := r.CreateMerchant(ctx, "Invalid domain", &bad); err == nil {
		t.Fatal("invalid domain created")
	}
	if f.client.Merchant.Query().CountX(ctx) != before {
		t.Fatal("invalid domain left merchant")
	}
	for _, value := range []string{"example.com", "www.example.co.uk", "xn--bcher-kva.de", "shop-2.example.com"} {
		if actual, err := merchantIconDomain(value); err != nil || actual != value {
			t.Errorf("valid domain %q: %s %v", value, actual, err)
		}
	}
}
