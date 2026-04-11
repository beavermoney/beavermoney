package fxrate

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/shopspring/decimal"
)

type FrankfurterProvider struct {
	client  *http.Client
	baseURL string
}

func NewFrankfurterProvider(baseURL string) *FrankfurterProvider {
	return &FrankfurterProvider{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		baseURL: baseURL,
	}
}

type v2RateRecord struct {
	Date  string      `json:"date"`
	Base  string      `json:"base"`
	Quote string      `json:"quote"`
	Rate  json.Number `json:"rate"`
}

func (p *FrankfurterProvider) GetRate(
	ctx context.Context,
	fromCurrency, toCurrency string,
	datetime time.Time,
) (decimal.Decimal, error) {
	dateStr := datetime.Format("2006-01-02")
	url := fmt.Sprintf(
		"%s/v2/rates?date=%s&base=%s&quotes=%s",
		p.baseURL,
		dateStr,
		fromCurrency,
		toCurrency,
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return decimal.Zero, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := p.client.Do(req)
	if err != nil {
		return decimal.Zero, fmt.Errorf("failed to fetch exchange rate: %w", err)
	}
	defer resp.Body.Close() //nolint:errcheck

	if resp.StatusCode != http.StatusOK {
		return decimal.Zero, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var records []v2RateRecord
	if err := json.NewDecoder(resp.Body).Decode(&records); err != nil {
		return decimal.Zero, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(records) == 0 {
		return decimal.Zero, fmt.Errorf("no rate found for %s->%s on %s", fromCurrency, toCurrency, dateStr)
	}

	rate, err := decimal.NewFromString(records[0].Rate.String())
	if err != nil {
		return decimal.Zero, fmt.Errorf("failed to parse rate: %w", err)
	}

	return rate, nil
}

// GetRates fetches exchange rates for multiple fromCurrencies to a single toCurrency.
// This is optimized to make a single API call by using inverse rates.
// To get USD->EUR, GBP->EUR, JPY->EUR, we query with base=EUR&quotes=USD,GBP,JPY
// and then invert the results.
func (p *FrankfurterProvider) GetRates(
	ctx context.Context,
	fromCurrencies []string,
	toCurrency string,
	datetime time.Time,
) (map[string]decimal.Decimal, error) {
	if len(fromCurrencies) == 0 {
		return make(map[string]decimal.Decimal), nil
	}

	if len(fromCurrencies) == 1 {
		rate, err := p.GetRate(ctx, fromCurrencies[0], toCurrency, datetime)
		if err != nil {
			return nil, err
		}
		return map[string]decimal.Decimal{fromCurrencies[0]: rate}, nil
	}

	dateStr := datetime.Format("2006-01-02")
	quotesStr := strings.Join(fromCurrencies, ",")
	url := fmt.Sprintf(
		"%s/v2/rates?date=%s&base=%s&quotes=%s",
		p.baseURL,
		dateStr,
		toCurrency,
		quotesStr,
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch exchange rate: %w", err)
	}
	defer resp.Body.Close() //nolint:errcheck

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var records []v2RateRecord
	if err := json.NewDecoder(resp.Body).Decode(&records); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	results := make(map[string]decimal.Decimal, len(fromCurrencies))

	for _, record := range records {
		rate, err := decimal.NewFromString(record.Rate.String())
		if err != nil {
			return nil, fmt.Errorf("failed to parse rate for %s: %w", record.Quote, err)
		}

		if rate.IsZero() {
			return nil, fmt.Errorf("invalid rate (zero) for currency %s", record.Quote)
		}
		// Invert: we queried base=toCurrency, so record.Rate is toCurrency->fromCurrency.
		// We need fromCurrency->toCurrency.
		results[record.Quote] = decimal.NewFromInt(1).Div(rate)
	}

	return results, nil
}
