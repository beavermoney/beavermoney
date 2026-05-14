package crypto

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/shopspring/decimal"
)

type EODHDProvider struct {
	apiKey  string
	client  *http.Client
	baseURL string
}

func NewEODHDProvider(apiKey string) *EODHDProvider {
	return &EODHDProvider{
		apiKey: apiKey,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		baseURL: "https://eodhd.com/api",
	}
}

type eodhdRealTimeResponse struct {
	Code      string  `json:"code"`
	Timestamp int64   `json:"timestamp"`
	Gmtoffset int     `json:"gmtoffset"`
	Open      float64 `json:"open"`
	High      float64 `json:"high"`
	Low       float64 `json:"low"`
	Close     float64 `json:"close"`
	Volume    int64   `json:"volume"`
}

type eodhdHistoricalDataPoint struct {
	Date          string  `json:"date"`
	Open          float64 `json:"open"`
	High          float64 `json:"high"`
	Low           float64 `json:"low"`
	Close         float64 `json:"close"`
	AdjustedClose float64 `json:"adjusted_close"`
	Volume        int64   `json:"volume"`
}

func normalizeCryptoSymbol(symbol string) string {
	if strings.HasSuffix(symbol, ".CC") {
		return symbol
	}
	if !strings.Contains(symbol, "-") {
		symbol = symbol + "-USD"
	}
	return symbol + ".CC"
}

func (p *EODHDProvider) Quote(
	ctx context.Context,
	symbol string,
) (*QuoteResult, error) {
	symbol = normalizeCryptoSymbol(symbol)

	url := fmt.Sprintf(
		"%s/real-time/%s?api_token=%s&fmt=json",
		p.baseURL,
		symbol,
		p.apiKey,
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch crypto quote: %w", err)
	}
	defer resp.Body.Close() //nolint:errcheck

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("EODHD API returned status %d", resp.StatusCode)
	}

	var rtData eodhdRealTimeResponse
	if err := json.NewDecoder(resp.Body).Decode(&rtData); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	parts := strings.Split(strings.TrimSuffix(rtData.Code, ".CC"), "-")
	baseCurrency := parts[0]
	quoteCurrency := "USD"
	if len(parts) > 1 {
		quoteCurrency = parts[1]
	}

	return &QuoteResult{
		Symbol:       baseCurrency,
		Name:         baseCurrency,
		Exchange:     "Crypto",
		Currency:     quoteCurrency,
		CurrentPrice: decimal.NewFromFloat(rtData.Close),
	}, nil
}

func (p *EODHDProvider) Quotes(
	ctx context.Context,
	symbols []string,
) (map[string]*QuoteResult, error) {
	if len(symbols) == 0 {
		return make(map[string]*QuoteResult), nil
	}

	results := make(map[string]*QuoteResult, len(symbols))
	for _, symbol := range symbols {
		quote, err := p.Quote(ctx, symbol)
		if err != nil {
			continue
		}
		results[symbol] = quote
	}
	return results, nil
}

func (p *EODHDProvider) HistoricalQuote(
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

	originalSymbol := symbol
	symbol = normalizeCryptoSymbol(symbol)

	url := fmt.Sprintf(
		"%s/eod/%s?api_token=%s&fmt=json&period=%s&from=%s&to=%s",
		p.baseURL,
		symbol,
		p.apiKey,
		period,
		from.Format("2006-01-02"),
		to.Format("2006-01-02"),
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch historical data: %w", err)
	}
	defer resp.Body.Close() //nolint:errcheck

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("EODHD API returned status %d", resp.StatusCode)
	}

	var histData []eodhdHistoricalDataPoint
	if err := json.NewDecoder(resp.Body).Decode(&histData); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	dataPoints := make([]HistoricalDataPoint, 0, len(histData))
	for _, point := range histData {
		date, err := time.Parse("2006-01-02", point.Date)
		if err != nil {
			return nil, fmt.Errorf(
				"failed to parse date %s: %w",
				point.Date,
				err,
			)
		}
		dataPoints = append(dataPoints, HistoricalDataPoint{
			Date:  date,
			Close: decimal.NewFromFloat(point.AdjustedClose),
		})
	}

	parts := strings.Split(strings.TrimSuffix(symbol, ".CC"), "-")
	baseCurrency := parts[0]
	quoteCurrency := "USD"
	if len(parts) > 1 {
		quoteCurrency = parts[1]
	}

	result := &HistoricalQuoteResult{
		Symbol: originalSymbol,
		Period: period,
		Data:   dataPoints,
	}
	result.Metadata.Name = baseCurrency
	result.Metadata.Exchange = "Crypto"
	result.Metadata.Currency = quoteCurrency

	return result, nil
}
