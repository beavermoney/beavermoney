package gql

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"unicode/utf8"

	"beavermoney.app/ent"
	"beavermoney.app/ent/merchant"
	"beavermoney.app/ent/transaction"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/gql/model"
	"beavermoney.app/internal/contextkeys"
	"entgo.io/ent/dialect"
	"entgo.io/ent/dialect/sql"
	"github.com/shopspring/decimal"
	"golang.org/x/text/cases"
	"golang.org/x/text/unicode/norm"
)

func merchantNameKey(name string) (string, string, error) {
	name = strings.Join(strings.Fields(norm.NFKC.String(name)), " ")
	key := cases.Fold().String(name)
	if name == "" || utf8.RuneCountInString(name) > 120 || len(key) > 512 {
		return "", "", fmt.Errorf("merchant name must contain 1–120 characters")
	}
	return name, key, nil
}

func (r *mutationResolver) createMerchant(ctx context.Context, name string, icon *string) (*ent.Merchant, error) {
	c := ent.FromContext(ctx)
	if err := lockReviewState(ctx, c); err != nil {
		return nil, err
	}
	display, key, err := merchantNameKey(name)
	if err != nil {
		return nil, err
	}
	if icon != nil {
		normalized, err := merchantIconDomain(*icon)
		if err != nil {
			return nil, err
		}
		icon = &normalized
	}
	existing, err := c.Merchant.Query().Where(merchant.NameKeyEQ(key)).Only(ctx)
	if err == nil {
		if icon != nil && (existing.Icon == nil || *existing.Icon != *icon) {
			return nil, fmt.Errorf("a merchant with this name already exists; edit its logo instead")
		}
		return existing, nil
	}
	if !ent.IsNotFound(err) {
		return nil, err
	}
	return c.Merchant.Create().SetHouseholdID(contextkeys.GetHouseholdID(ctx)).SetName(display).SetNameKey(key).SetNillableIcon(icon).Save(ctx)
}
func (r *mutationResolver) updateMerchant(ctx context.Context, id int, name, icon *string, clearIcon *bool) (*ent.Merchant, error) {
	c := ent.FromContext(ctx)
	if err := lockReviewState(ctx, c); err != nil {
		return nil, err
	}
	if _, err := c.Merchant.Get(ctx, id); err != nil {
		return nil, err
	}
	b := c.Merchant.UpdateOneID(id)
	if name != nil {
		display, key, err := merchantNameKey(*name)
		if err != nil {
			return nil, err
		}
		exists, err := c.Merchant.Query().Where(merchant.NameKeyEQ(key), merchant.IDNEQ(id)).Exist(ctx)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, fmt.Errorf("a merchant with this name already exists; merge them instead")
		}
		b.SetName(display).SetNameKey(key)
	}
	if icon != nil {
		if clearIcon != nil && *clearIcon {
			return nil, fmt.Errorf("choose a logo or remove it, not both")
		}
		normalized, err := merchantIconDomain(*icon)
		if err != nil {
			return nil, err
		}
		icon = &normalized
		b.SetIcon(*icon)
	}
	if clearIcon != nil && *clearIcon {
		b.ClearIcon()
	}
	return b.Save(ctx)
}
func (r *mutationResolver) mergeMerchant(ctx context.Context, sourceID, targetID int) (*model.MergeMerchantPayload, error) {
	if sourceID == targetID {
		return nil, fmt.Errorf("choose a different destination merchant")
	}
	c := ent.FromContext(ctx)
	if err := lockReviewState(ctx, c); err != nil {
		return nil, err
	}
	if _, err := c.Merchant.Get(ctx, sourceID); err != nil {
		return nil, err
	}
	target, err := c.Merchant.Get(ctx, targetID)
	if err != nil {
		return nil, err
	}
	count, err := c.Transaction.Update().Where(transaction.MerchantIDEQ(sourceID)).SetMerchantID(targetID).Save(ctx)
	if err != nil {
		return nil, err
	}
	if err := c.Merchant.DeleteOneID(sourceID).Exec(ctx); err != nil {
		return nil, err
	}
	return &model.MergeMerchantPayload{DeletedMerchantID: sourceID, TargetMerchant: target, ReassignedCount: count}, nil
}
func (r *mutationResolver) expenseMerchant(ctx context.Context, c *ent.Client, categoryID int, id *int, name *string) (*int, error) {
	if id != nil && name != nil {
		return nil, fmt.Errorf("choose an existing merchant or enter a name, not both")
	}
	category, err := c.TransactionCategory.Get(ctx, categoryID)
	if err != nil {
		return nil, err
	}
	if category.Type != transactioncategory.TypeExpense {
		return nil, fmt.Errorf("merchant assignment requires an expense category")
	}
	if id == nil && name == nil {
		return nil, nil
	}
	if err := lockReviewState(ctx, c); err != nil {
		return nil, err
	}
	if id != nil {
		m, err := c.Merchant.Get(ctx, *id)
		if err != nil {
			return nil, err
		}
		return &m.ID, nil
	}
	m, err := r.createMerchant(ctx, *name, nil)
	if err != nil {
		return nil, err
	}
	return &m.ID, nil
}
func (r *mutationResolver) prepareMerchantUpdate(ctx context.Context, c *ent.Client, id int, input *ent.UpdateTransactionInput, name *string) error {
	if input.ClearMerchant && (input.MerchantID != nil || name != nil) {
		return fmt.Errorf("choose a merchant or remove it, not both")
	}
	if input.MerchantID == nil && name == nil && input.CategoryID == nil {
		return nil
	}
	if err := lockReviewState(ctx, c); err != nil {
		return err
	}
	current, err := c.Transaction.Get(ctx, id)
	if err != nil {
		return err
	}
	categoryID := current.CategoryID
	if input.CategoryID != nil {
		categoryID = *input.CategoryID
	}
	category, err := c.TransactionCategory.Get(ctx, categoryID)
	if err != nil {
		return err
	}
	if category.Type != transactioncategory.TypeExpense {
		if input.MerchantID != nil || name != nil {
			return fmt.Errorf("only expenses can have a merchant")
		}
		input.ClearMerchant = true
		return nil
	}
	if input.MerchantID != nil || name != nil {
		mid, err := r.expenseMerchant(ctx, c, categoryID, input.MerchantID, name)
		if err != nil {
			return err
		}
		input.MerchantID = mid
	}
	return nil
}

// Group in SQL, so long merchant histories do not load individual transactions.
// Each expense has one category/month, making grouped distinct counts additive.
type merchantSpendGroup struct {
	MerchantID *int            `sql:"merchant_id"`
	CategoryID int             `sql:"category_id"`
	Month      string          `sql:"month"`
	Total      decimal.Decimal `sql:"total"`
	Count      int             `sql:"count"`
	Missing    int             `sql:"missing"`
}

func (r *Resolver) merchantGroups(ctx context.Context, hhID int, period model.TimePeriodInput, users []int, merchantID *int) ([]merchantSpendGroup, error) {
	if hhID != contextkeys.GetHouseholdID(ctx) {
		return nil, fmt.Errorf("household does not match the active household")
	}
	if err := r.validateViewUserIDs(ctx, hhID, users); err != nil {
		return nil, err
	}
	dc := contextkeys.GetDisplayCurrency(ctx)
	if dc == nil {
		return nil, fmt.Errorf("display currency is required")
	}
	if _, err := r.entClient.HouseholdCurrency.Get(ctx, dc.HouseholdCurrencyID); err != nil {
		return nil, fmt.Errorf("display currency is unavailable: %w", err)
	}
	start, end := parseTimePeriod(period)
	if !start.IsZero() && !end.After(start) {
		return nil, fmt.Errorf("end date must be after start date")
	}
	var groups []merchantSpendGroup
	err := r.entClient.Transaction.Query().Modify(func(s *sql.Selector) {
		te := sql.Table("transaction_entries")
		ac := sql.Table("accounts")
		tc := sql.Table("transaction_categories")
		rates := sql.Table("household_rates")
		s.Join(te).On(s.C("id"), te.C("transaction_id"))
		s.Join(ac).On(te.C("account_id"), ac.C("id"))
		s.Join(tc).On(s.C("category_id"), tc.C("id"))
		s.LeftJoin(rates).OnP(sql.And(sql.ColumnsEQ(ac.C("household_currency_id"), rates.C("from_household_currency_id")), sql.EQ(rates.C("to_household_currency_id"), dc.HouseholdCurrencyID), sql.EQ(rates.C("household_id"), hhID)))
		s.Where(sql.And(sql.EQ(s.C("household_id"), hhID), sql.EQ(tc.C("type"), "expense"), sql.EQ(s.C("exclude_from_reports"), false)))
		if len(users) > 0 {
			values := make([]any, len(users))
			for i, u := range users {
				values[i] = u
			}
			s.Where(sql.In(ac.C("user_id"), values...))
		}
		if merchantID != nil {
			s.Where(sql.EQ(s.C("merchant_id"), *merchantID))
		}
		if !start.IsZero() {
			s.Where(sql.GTE(s.C("datetime"), start))
		}
		if !end.IsZero() {
			s.Where(sql.LT(s.C("datetime"), end))
		}
		month := fmt.Sprintf("strftime('%%Y-%%m', %s)", s.C("datetime"))
		if s.Dialect() == dialect.Postgres {
			month = fmt.Sprintf("to_char(%s AT TIME ZONE 'UTC', 'YYYY-MM')", s.C("datetime"))
		}
		s.Select(s.C("merchant_id"), s.C("category_id"))
		s.AppendSelectExpr(sql.Expr(month+" AS month"), sql.Expr(fmt.Sprintf("-COALESCE(SUM(%s * CASE WHEN %s = %d THEN 1 ELSE %s END),0) AS total", te.C("amount"), ac.C("household_currency_id"), dc.HouseholdCurrencyID, rates.C("rate"))), sql.Expr(fmt.Sprintf("COUNT(DISTINCT %s) AS count", s.C("id"))), sql.Expr(fmt.Sprintf("SUM(CASE WHEN %s <> %d AND (%s IS NULL OR %s <= 0) THEN 1 ELSE 0 END) AS missing", ac.C("household_currency_id"), dc.HouseholdCurrencyID, rates.C("rate"), rates.C("rate"))))
		s.GroupBy(s.C("merchant_id"), s.C("category_id"), month)
	}).Scan(ctx, &groups)
	if err != nil {
		return nil, err
	}
	for _, g := range groups {
		if g.Missing > 0 {
			return nil, fmt.Errorf("exchange rate unavailable; refresh rates before viewing merchant insights")
		}
	}
	return groups, nil
}
func merchantSummary(groups []merchantSpendGroup) *model.MerchantSpendSummary {
	total := decimal.Zero
	count := 0
	for _, g := range groups {
		total = total.Add(g.Total)
		count += g.Count
	}
	avg := decimal.Zero
	if count > 0 {
		avg = total.Div(decimal.NewFromInt(int64(count)))
	}
	return &model.MerchantSpendSummary{Total: total.String(), TransactionCount: count, Average: avg.String()}
}
func (r *Resolver) merchantOverview(ctx context.Context, hhID int, period model.TimePeriodInput, users []int) (*model.MerchantOverview, error) {
	groups, err := r.merchantGroups(ctx, hhID, period, users, nil)
	if err != nil {
		return nil, err
	}
	merchants, err := r.entClient.Merchant.Query().All(ctx)
	if err != nil {
		return nil, err
	}
	grouped := map[int][]merchantSpendGroup{}
	for _, g := range groups {
		id := 0
		if g.MerchantID != nil {
			id = *g.MerchantID
		}
		grouped[id] = append(grouped[id], g)
	}
	out := &model.MerchantOverview{CurrencyCode: contextkeys.GetDisplayCurrency(ctx).Code, Total: merchantSummary(groups), Unassigned: merchantSummary(grouped[0]), Merchants: []*model.MerchantPeriodSummary{}}
	for _, m := range merchants {
		out.Merchants = append(out.Merchants, &model.MerchantPeriodSummary{Merchant: m, Summary: merchantSummary(grouped[m.ID])})
	}
	sort.Slice(out.Merchants, func(i, j int) bool {
		a, b := out.Merchants[i], out.Merchants[j]
		cmp := decimal.RequireFromString(a.Summary.Total).Cmp(decimal.RequireFromString(b.Summary.Total))
		if cmp == 0 {
			return a.Merchant.NameKey < b.Merchant.NameKey
		}
		return cmp > 0
	})
	return out, nil
}
func (r *Resolver) merchantDetail(ctx context.Context, m *ent.Merchant, period model.TimePeriodInput, users []int) (*model.MerchantInsights, error) {
	groups, err := r.merchantGroups(ctx, m.HouseholdID, period, users, &m.ID)
	if err != nil {
		return nil, err
	}
	lifetime, err := r.merchantGroups(ctx, m.HouseholdID, model.TimePeriodInput{}, users, &m.ID)
	if err != nil {
		return nil, err
	}
	out := &model.MerchantInsights{CurrencyCode: contextkeys.GetDisplayCurrency(ctx).Code, Period: merchantSummary(groups), Lifetime: merchantSummary(lifetime), Categories: []*model.MerchantCategorySummary{}, Monthly: []*model.MerchantMonthlySummary{}}
	cats := map[int][]merchantSpendGroup{}
	months := map[string][]merchantSpendGroup{}
	for _, g := range groups {
		cats[g.CategoryID] = append(cats[g.CategoryID], g)
		months[g.Month] = append(months[g.Month], g)
	}
	for id, gs := range cats {
		cat, err := r.entClient.TransactionCategory.Get(ctx, id)
		if err != nil {
			return nil, err
		}
		summary := merchantSummary(gs)
		out.Categories = append(out.Categories, &model.MerchantCategorySummary{Category: cat, Total: summary.Total, TransactionCount: summary.TransactionCount})
	}
	sort.Slice(out.Categories, func(i, j int) bool {
		a, b := out.Categories[i], out.Categories[j]
		cmp := decimal.RequireFromString(a.Total).Cmp(decimal.RequireFromString(b.Total))
		if cmp == 0 {
			return a.Category.Name < b.Category.Name
		}
		return cmp > 0
	})
	for month, gs := range months {
		summary := merchantSummary(gs)
		out.Monthly = append(out.Monthly, &model.MerchantMonthlySummary{Month: month, Total: summary.Total, TransactionCount: summary.TransactionCount})
	}
	sort.Slice(out.Monthly, func(i, j int) bool { return out.Monthly[i].Month < out.Monthly[j].Month })
	return out, nil
}
func (r *Resolver) searchMerchants(ctx context.Context, hhID int, query string, first *int) ([]*ent.Merchant, error) {
	if hhID != contextkeys.GetHouseholdID(ctx) {
		return nil, fmt.Errorf("household does not match the active household")
	}
	limit := 20
	if first != nil {
		limit = *first
	}
	if limit < 1 || limit > 50 {
		return nil, fmt.Errorf("merchant search limit must be between 1 and 50")
	}
	key := cases.Fold().String(strings.Join(strings.Fields(norm.NFKC.String(query)), " "))
	if len(key) > 512 {
		return nil, fmt.Errorf("merchant search is too long")
	}
	return r.entClient.Merchant.Query().Where(merchant.NameKeyContains(key)).Modify(func(s *sql.Selector) {
		s.OrderExpr(sql.Expr(fmt.Sprintf("(SELECT MAX(t.datetime) FROM transactions t WHERE t.merchant_id = %s) DESC NULLS LAST", s.C("id"))))
		s.OrderBy(s.C("name_key"))
	}).Limit(limit).All(ctx)
}

// Merchant icons follow Account.icon: a Logo.dev domain, never an uploaded file
// reference or arbitrary URL. Keep the stored identity independent of CDN URLs.
func merchantIconDomain(value string) (string, error) {
	value = strings.ToLower(strings.TrimSpace(value))
	invalid := func() (string, error) { return "", fmt.Errorf("enter a website domain such as example.com") }
	if len(value) > 253 || !strings.Contains(value, ".") {
		return invalid()
	}
	labels := strings.Split(value, ".")
	for _, label := range labels {
		if len(label) == 0 || len(label) > 63 || label[0] == '-' || label[len(label)-1] == '-' {
			return invalid()
		}
		for _, r := range label {
			switch {
			case r >= 'a' && r <= 'z', r >= '0' && r <= '9', r == '-':
			default:
				return invalid()
			}
		}
	}
	// A DNS suffix starts with a letter; numeric IP addresses are not logo domains.
	if labels[len(labels)-1][0] < 'a' || labels[len(labels)-1][0] > 'z' {
		return invalid()
	}
	return value, nil
}
