package gql

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/snapshotaccount"
	"beavermoney.app/ent/snapshotinvestment"
	"beavermoney.app/gql/model"
	"entgo.io/ent/dialect/sql"
	"github.com/shopspring/decimal"
)

// DISTINCT ON returns one indexed observation per entity, including archived
// entities. Filtering today's archive status here would rewrite old reviews.
func latestObservation(subject string, columns []string, at time.Time) func(*sql.Selector) {
	return func(s *sql.Selector) {
		if !at.IsZero() {
			s.Where(sql.LTE(s.C("create_time"), at))
		}
		selected := make([]string, len(columns))
		for i, col := range columns {
			selected[i] = s.C(col)
		}
		s.SetDistinct(false).SelectExpr(sql.Expr("DISTINCT ON ("+s.C(subject)+") "+strings.Join(selected, ", "))).
			OrderBy(s.C(subject), sql.Desc(s.C("create_time")))
	}
}
func latestAccountObservations(ctx context.Context, c *ent.Client, at time.Time) ([]*ent.SnapshotAccount, error) {
	return c.SnapshotAccount.Query().Modify(latestObservation("account_id", snapshotaccount.Columns, at)).
		WithAccount(func(q *ent.AccountQuery) { q.WithUser().WithHouseholdCurrency() }).All(ctx)
}
func latestInvestmentObservations(ctx context.Context, c *ent.Client, at time.Time) ([]*ent.SnapshotInvestment, error) {
	return c.SnapshotInvestment.Query().Modify(latestObservation("investment_id", snapshotinvestment.Columns, at)).
		WithInvestment(func(q *ent.InvestmentQuery) { q.WithHouseholdCurrency() }).All(ctx)
}
func sameTime(a, b *time.Time) bool {
	return a == nil && b == nil || a != nil && b != nil && a.Equal(*b)
}
func sameAverage(stored *decimal.Decimal, value *string) bool {
	if stored == nil || value == nil {
		return stored == nil && value == nil
	}
	d, err := decimal.NewFromString(*value)
	return err == nil && stored.Equal(d)
}
func saveChangedObservations(ctx context.Context, c *ent.Client, snap *ent.Snapshot, accounts []*ent.Account, previousAccounts []*ent.SnapshotAccount, previousInvestments []*ent.SnapshotInvestment) error {
	byAccount := map[int]*ent.SnapshotAccount{}
	byInvestment := map[int]*ent.SnapshotInvestment{}
	for _, a := range previousAccounts {
		byAccount[a.AccountID] = a
	}
	for _, i := range previousInvestments {
		byInvestment[i.InvestmentID] = i
	}
	for _, a := range accounts {
		prev := byAccount[a.ID]
		if prev == nil || !prev.Balance.Equal(a.Balance) || prev.Archived != a.Archived {
			if err := c.SnapshotAccount.Create().SetHouseholdID(snap.HouseholdID).SetAccountID(a.ID).
				SetCreateTime(snap.CreateTime).SetBalance(a.Balance).SetArchived(a.Archived).Exec(ctx); err != nil {
				return err
			}
		}
		for _, i := range a.Edges.Investments {
			prev := byInvestment[i.ID]
			needsReview := averageNeedsReview(i)
			if prev != nil && prev.Quantity.Equal(i.Amount) && prev.MarketPrice.Equal(i.Quote) &&
				sameAverage(prev.AverageCost, i.ConfirmedAverageCost) && sameTime(prev.AverageConfirmedAt, i.AverageCostConfirmedAt) &&
				prev.NeedsReview == needsReview && prev.Archived == i.Archived {
				continue
			}
			var average *decimal.Decimal
			if i.ConfirmedAverageCost != nil {
				d, err := decimal.NewFromString(*i.ConfirmedAverageCost)
				if err != nil {
					return err
				}
				average = &d
			}
			if err := c.SnapshotInvestment.Create().SetHouseholdID(snap.HouseholdID).SetInvestmentID(i.ID).
				SetCreateTime(snap.CreateTime).SetQuantity(i.Amount).SetMarketPrice(i.Quote).
				SetNillableAverageCost(average).SetNillableAverageConfirmedAt(i.AverageCostConfirmedAt).
				SetNeedsReview(needsReview).SetArchived(i.Archived).Exec(ctx); err != nil {
				return err
			}
		}
	}
	return nil
}

func resolveSnapshotReview(ctx context.Context, c *ent.Client, obj *ent.Snapshot) (*model.SnapshotReview, error) {
	// Ent's field collection may not select format_version for a computed field.
	snap, err := c.Snapshot.Get(ctx, obj.ID)
	if err != nil {
		return nil, err
	}
	if snap.FormatVersion == 0 {
		return nil, nil
	}
	accounts, err := latestAccountObservations(ctx, c, snap.CreateTime)
	if err != nil {
		return nil, err
	}
	investments, err := latestInvestmentObservations(ctx, c, snap.CreateTime)
	if err != nil {
		return nil, err
	}
	storedRates, err := snap.QuerySnapshotRates().WithFromCurrency().WithToCurrency().All(ctx)
	if err != nil {
		return nil, err
	}
	return buildSnapshotReview(accounts, investments, storedRates)
}

func buildSnapshotReview(accounts []*ent.SnapshotAccount, investments []*ent.SnapshotInvestment, storedRates []*ent.SnapshotRate) (*model.SnapshotReview, error) {
	sort.Slice(accounts, func(i, j int) bool { return accounts[i].AccountID < accounts[j].AccountID })
	sort.Slice(investments, func(i, j int) bool { return investments[i].InvestmentID < investments[j].InvestmentID })
	sort.Slice(storedRates, func(i, j int) bool {
		return storedRates[i].FromHouseholdCurrencyID < storedRates[j].FromHouseholdCurrencyID || storedRates[i].FromHouseholdCurrencyID == storedRates[j].FromHouseholdCurrencyID && storedRates[i].ToHouseholdCurrencyID < storedRates[j].ToHouseholdCurrencyID
	})
	doc := &model.SnapshotReview{Version: 2, Complete: true, ActiveAccountIds: []int{}, Accounts: []*model.SnapshotAccountState{}, Rates: []*model.SnapshotRateState{}}
	rates := map[string]decimal.Decimal{}
	for _, r := range storedRates {
		from, to := r.Edges.FromCurrency.Code, r.Edges.ToCurrency.Code
		rates[from+"/"+to] = r.Rate
		doc.Rates = append(doc.Rates, &model.SnapshotRateState{From: from, To: to, Rate: r.Rate.String()})
	}
	byAccount := map[int]*model.SnapshotAccountState{}
	for _, o := range accounts {
		a := o.Edges.Account
		var category *string
		if a.Category != nil {
			v := string(*a.Category)
			category = &v
		}
		state := &model.SnapshotAccountState{AccountID: a.ID, Icon: a.Icon, Name: a.Name, Type: string(a.Type), Category: category,
			OwnerID: a.UserID, OwnerName: reviewOwnerName(a), Currency: a.Edges.HouseholdCurrency.Code, Cash: o.Balance.String(), Value: o.Balance.String(), Archived: o.Archived, Holdings: []*model.SnapshotInvestmentState{}}
		byAccount[a.ID] = state
		doc.Accounts = append(doc.Accounts, state)
		if !o.Archived {
			doc.ActiveAccountIds = append(doc.ActiveAccountIds, a.ID)
		}
	}
	for _, o := range investments {
		i := o.Edges.Investment
		a := byAccount[i.AccountID]
		if a == nil {
			return nil, fmt.Errorf("snapshot investment %d has no account observation", i.ID)
		}
		var average *string
		if o.AverageCost != nil {
			v := o.AverageCost.String()
			average = &v
		}
		value := o.Quantity.Mul(o.MarketPrice)
		currency := i.Edges.HouseholdCurrency.Code
		a.Holdings = append(a.Holdings, &model.SnapshotInvestmentState{InvestmentID: i.ID, Name: i.Name, Symbol: i.Symbol, Currency: currency,
			Quantity: o.Quantity.String(), Price: o.MarketPrice.String(), Value: value.String(), Average: average,
			ConfirmedAt: o.AverageConfirmedAt, NeedsReview: o.NeedsReview, Archived: o.Archived})
		rate := decimal.NewFromInt(1)
		if currency != a.Currency {
			var ok bool
			rate, ok = rates[currency+"/"+a.Currency]
			if !ok || !rate.IsPositive() {
				return nil, fmt.Errorf("snapshot is missing FX for %s/%s", currency, a.Currency)
			}
		}
		a.Value = decimal.RequireFromString(a.Value).Add(value.Mul(rate)).String()
	}
	return doc, nil
}
