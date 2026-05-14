package crypto

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/beavermoney/finance-go/chart"
	"github.com/beavermoney/finance-go/datetime"
	"github.com/beavermoney/finance-go/equity"
	"github.com/shopspring/decimal"
)

type YahooProvider struct{}

func NewYahooProvider() *YahooProvider {
	return &YahooProvider{}
}

func (p *YahooProvider) Quote(
	ctx context.Context,
	symbol string,
) (*QuoteResult, error) {
	e, err := equity.Get(symbol)
	if err != nil {
		return nil, err
	}

	if e == nil || e.CurrencyID == "" {
		return nil, errors.New("asset not found")
	}

	return &QuoteResult{
		Symbol:       e.Symbol,
		Name:         e.LongName,
		Exchange:     e.FullExchangeName,
		Currency:     e.CurrencyID,
		CurrentPrice: decimal.NewFromFloat(e.RegularMarketPrice),
	}, nil
}

func (p *YahooProvider) Quotes(
	ctx context.Context,
	symbols []string,
) (map[string]*QuoteResult, error) {
	if len(symbols) == 0 {
		return make(map[string]*QuoteResult), nil
	}

	iter := equity.List(symbols)
	results := make(map[string]*QuoteResult, len(symbols))

	for iter.Next() {
		e := iter.Equity()
		if e != nil && e.CurrencyID != "" {
			results[e.Symbol] = &QuoteResult{
				Symbol:       e.Symbol,
				Name:         e.LongName,
				Exchange:     e.FullExchangeName,
				Currency:     e.CurrencyID,
				CurrentPrice: decimal.NewFromFloat(e.RegularMarketPrice),
			}
		}
	}

	if err := iter.Err(); err != nil {
		return nil, err
	}

	return results, nil
}

func (p *YahooProvider) HistoricalQuote(
	ctx context.Context,
	symbol string,
	period string,
	from time.Time,
	to time.Time,
) (*HistoricalQuoteResult, error) {
	interval, err := periodToInterval(period)
	if err != nil {
		return nil, err
	}

	params := &chart.Params{
		Symbol:   symbol,
		Start:    datetime.New(&from),
		End:      datetime.New(&to),
		Interval: interval,
	}
	params.Context = &ctx

	iter := chart.Get(params)

	result := &HistoricalQuoteResult{
		Symbol: symbol,
		Period: period,
	}

	meta := iter.Meta()
	result.Metadata.Name = meta.Symbol
	result.Metadata.Exchange = meta.ExchangeName
	result.Metadata.Currency = meta.Currency

	for iter.Next() {
		bar := iter.Bar()
		if bar == nil {
			continue
		}
		close := bar.AdjClose
		if close.IsZero() {
			close = bar.Close
		}
		t := time.Unix(int64(bar.Timestamp), 0).UTC()
		result.Data = append(result.Data, HistoricalDataPoint{
			Date:  t,
			Close: close,
		})
	}

	if err := iter.Err(); err != nil {
		return nil, fmt.Errorf("chart fetch failed for %s: %w", symbol, err)
	}

	return result, nil
}

func periodToInterval(period string) (datetime.Interval, error) {
	switch period {
	case "d":
		return datetime.OneDay, nil
	case "w":
		return datetime.FiveDay, nil
	case "m":
		return datetime.OneMonth, nil
	default:
		return "", fmt.Errorf("unsupported period %q: use 'd', 'w', or 'm'", period)
	}
}
