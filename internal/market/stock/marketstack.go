package stock

import (
	"context"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/shopspring/decimal"

	"beavermoney.app/internal/marketstack"
)

type MarketstackProvider struct {
	apiKey string
	client *marketstack.ClientWithResponses
}

func NewMarketstackProvider(apiKey string) (*MarketstackProvider, error) {
	httpClient := &http.Client{Timeout: 10 * time.Second}

	client, err := marketstack.NewClientWithResponses(
		"https://api.marketstack.com/v2",
		marketstack.WithHTTPClient(httpClient),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create marketstack client: %w", err)
	}

	return &MarketstackProvider{
		apiKey: apiKey,
		client: client,
	}, nil
}

func (p *MarketstackProvider) Quote(
	ctx context.Context,
	symbol string,
) (*QuoteResult, error) {
	results, err := p.fetchLatest(ctx, []string{symbol})
	if err != nil {
		return nil, err
	}

	if quote, ok := results[symbol]; ok {
		return quote, nil
	}
	return nil, fmt.Errorf("marketstack: no quote returned for symbol %q", symbol)
}

func (p *MarketstackProvider) Quotes(
	ctx context.Context,
	symbols []string,
) (map[string]*QuoteResult, error) {
	if len(symbols) == 0 {
		return make(map[string]*QuoteResult), nil
	}
	return p.fetchLatest(ctx, symbols)
}

func (p *MarketstackProvider) HistoricalQuote(
	ctx context.Context,
	symbol string,
	period string,
	from time.Time,
	to time.Time,
) (*HistoricalQuoteResult, error) {
	if period != "d" && period != "w" && period != "m" {
		return nil, fmt.Errorf(
			"invalid period: %s (must be 'd', 'w', or 'm')",
			period,
		)
	}

	dateFrom := openapi_types.Date{Time: from}
	dateTo := openapi_types.Date{Time: to}
	sort := marketstack.GetEodParamsSort("ASC")
	limit := 1000

	resp, err := p.client.GetEodWithResponse(ctx, &marketstack.GetEodParams{
		AccessKey: p.apiKey,
		Symbols:   symbol,
		DateFrom:  &dateFrom,
		DateTo:    &dateTo,
		Sort:      &sort,
		Limit:     &limit,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch historical data: %w", err)
	}

	if resp.StatusCode() != http.StatusOK || resp.JSON200 == nil ||
		resp.JSON200.Data == nil {
		return nil, fmt.Errorf(
			"marketstack API returned status %d",
			resp.StatusCode(),
		)
	}

	bars := *resp.JSON200.Data

	result := &HistoricalQuoteResult{
		Symbol: symbol,
		Period: period,
	}

	if len(bars) > 0 {
		first := bars[0]
		if first.Name != nil {
			result.Metadata.Name = *first.Name
		}
		if first.ExchangeCode != nil {
			result.Metadata.Exchange = *first.ExchangeCode
		} else if first.Exchange != nil {
			result.Metadata.Exchange = *first.Exchange
		}
		result.Metadata.Currency = barCurrency(first)
	}

	daily := make([]HistoricalDataPoint, 0, len(bars))
	for _, b := range bars {
		if b.Date == nil {
			continue
		}
		date, err := parseBarDate(*b.Date)
		if err != nil {
			return nil, fmt.Errorf("failed to parse date %s: %w", *b.Date, err)
		}
		daily = append(daily, HistoricalDataPoint{
			Date:  date,
			Close: barClose(b),
		})
	}

	result.Data = resamplePoints(daily, period)
	return result, nil
}

func (p *MarketstackProvider) fetchLatest(
	ctx context.Context,
	symbols []string,
) (map[string]*QuoteResult, error) {
	resp, err := p.client.GetEodLatestWithResponse(
		ctx,
		&marketstack.GetEodLatestParams{
			AccessKey: p.apiKey,
			Symbols:   strings.Join(symbols, ","),
		},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch stock quote: %w", err)
	}

	if resp.StatusCode() != http.StatusOK || resp.JSON200 == nil ||
		resp.JSON200.Data == nil {
		return nil, fmt.Errorf(
			"marketstack API returned status %d",
			resp.StatusCode(),
		)
	}

	results := make(map[string]*QuoteResult, len(symbols))
	for _, bar := range *resp.JSON200.Data {
		if bar.Symbol == nil {
			continue
		}
		sym := *bar.Symbol

		quote := &QuoteResult{
			Symbol:       sym,
			CurrentPrice: barClose(bar),
			Currency:     barCurrency(bar),
		}
		if bar.Name != nil {
			quote.Name = *bar.Name
		} else {
			quote.Name = sym
		}
		if bar.ExchangeCode != nil {
			quote.Exchange = *bar.ExchangeCode
		} else if bar.Exchange != nil {
			quote.Exchange = *bar.Exchange
		}

		results[sym] = quote
	}

	return results, nil
}

func barClose(bar marketstack.EODBar) decimal.Decimal {
	if bar.AdjClose != nil {
		return decimal.NewFromFloat32(*bar.AdjClose)
	}
	if bar.Close != nil {
		return decimal.NewFromFloat32(*bar.Close)
	}
	return decimal.Zero
}

func barCurrency(bar marketstack.EODBar) string {
	if bar.PriceCurrency != nil && *bar.PriceCurrency != "" {
		return strings.ToUpper(*bar.PriceCurrency)
	}
	return "USD"
}

// parseBarDate accepts the ISO8601 timestamp returned by marketstack (e.g.
// "2025-04-30T00:00:00+0000") and falls back to a plain YYYY-MM-DD parse.
func parseBarDate(s string) (time.Time, error) {
	if t, err := time.Parse(time.RFC3339, s); err == nil {
		return t, nil
	}
	return time.Parse("2006-01-02", s)
}

func resamplePoints(
	daily []HistoricalDataPoint,
	period string,
) []HistoricalDataPoint {
	if period == "d" || len(daily) == 0 {
		return daily
	}

	sort.Slice(daily, func(i, j int) bool {
		return daily[i].Date.Before(daily[j].Date)
	})

	bucketKey := func(t time.Time) string {
		switch period {
		case "w":
			year, week := t.ISOWeek()
			return fmt.Sprintf("%d-W%02d", year, week)
		case "m":
			return t.Format("2006-01")
		default:
			return t.Format("2006-01-02")
		}
	}

	buckets := make(map[string]HistoricalDataPoint, len(daily))
	order := make([]string, 0, len(daily))
	for _, p := range daily {
		key := bucketKey(p.Date)
		if _, seen := buckets[key]; !seen {
			order = append(order, key)
		}
		buckets[key] = p
	}

	out := make([]HistoricalDataPoint, 0, len(order))
	for _, key := range order {
		out = append(out, buckets[key])
	}
	return out
}
