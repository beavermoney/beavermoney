package fx

import (
	"context"
	"fmt"
	"sync"

	"beavermoney.app/ent"
	"beavermoney.app/ent/householdrate"
	"beavermoney.app/internal/contextkeys"
	"github.com/shopspring/decimal"
)

type ratesCache struct {
	once  sync.Once
	rates map[int]decimal.Decimal
	err   error
}

type contextKeyType struct{}

func contextKey() any { return contextKeyType{} }

func NewContext(ctx context.Context) context.Context {
	return context.WithValue(ctx, contextKey(), &ratesCache{})
}

// ConvertToDisplayCurrency converts an amount from fromCurrencyID to the
// request's display currency using cached household_rates. Returns the
// original amount unchanged if display currency matches fromCurrencyID.
func ConvertToDisplayCurrency(
	ctx context.Context,
	client *ent.Client,
	amount decimal.Decimal,
	fromCurrencyID int,
) (decimal.Decimal, error) {
	dc := contextkeys.GetDisplayCurrency(ctx)
	if dc == nil {
		return amount, fmt.Errorf("no display currency in context")
	}

	if fromCurrencyID == dc.CurrencyID {
		return amount, nil
	}

	rates, err := loadRates(ctx, client, dc.CurrencyID)
	if err != nil {
		return amount, err
	}

	rate, ok := rates[fromCurrencyID]
	if !ok {
		return amount, fmt.Errorf("no rate found from currency %d to display currency %d", fromCurrencyID, dc.CurrencyID)
	}

	return amount.Mul(rate), nil
}

func loadRates(ctx context.Context, client *ent.Client, toCurrencyID int) (map[int]decimal.Decimal, error) {
	cache := getRatesCache(ctx)
	if cache != nil {
		cache.once.Do(func() {
			cache.rates, cache.err = queryRates(ctx, client, toCurrencyID)
		})
		return cache.rates, cache.err
	}
	return queryRates(ctx, client, toCurrencyID)
}

func queryRates(ctx context.Context, client *ent.Client, toCurrencyID int) (map[int]decimal.Decimal, error) {
	householdID := contextkeys.GetHouseholdID(ctx)

	rows, err := client.HouseholdRate.Query().
		Where(
			householdrate.HouseholdIDEQ(householdID),
			householdrate.ToCurrencyIDEQ(toCurrencyID),
		).
		All(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to load household rates: %w", err)
	}

	rates := make(map[int]decimal.Decimal, len(rows))
	for _, row := range rows {
		rates[row.FromCurrencyID] = row.Rate
	}
	return rates, nil
}

func getRatesCache(ctx context.Context) *ratesCache {
	v, ok := ctx.Value(contextKey()).(*ratesCache)
	if !ok {
		return nil
	}
	return v
}
