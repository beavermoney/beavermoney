package crypto

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/shopspring/decimal"
)

type CoinbaseProvider struct {
	client  *http.Client
	baseURL string
}

func NewCoinbaseProvider() *CoinbaseProvider {
	return &CoinbaseProvider{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		baseURL: "https://api.coinbase.com",
	}
}

type coinbaseSpotResponse struct {
	Data struct {
		Amount   string `json:"amount"`
		Base     string `json:"base"`
		Currency string `json:"currency"`
	} `json:"data"`
}

func normalizeCoinbasePair(symbol string) string {
	symbol = strings.TrimSuffix(symbol, ".CC")
	symbol = strings.ToUpper(symbol)
	if !strings.Contains(symbol, "-") {
		symbol = symbol + "-USD"
	}
	return symbol
}

func (p *CoinbaseProvider) Quote(
	ctx context.Context,
	symbol string,
) (*QuoteResult, error) {
	pair := normalizeCoinbasePair(symbol)

	url := fmt.Sprintf("%s/v2/prices/%s/spot", p.baseURL, pair)

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
		return nil, fmt.Errorf("coinbase API returned status %d", resp.StatusCode)
	}

	var body coinbaseSpotResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	price, err := decimal.NewFromString(body.Data.Amount)
	if err != nil {
		return nil, fmt.Errorf("failed to parse price %q: %w", body.Data.Amount, err)
	}

	return &QuoteResult{
		Symbol:       body.Data.Base,
		Name:         body.Data.Base,
		Exchange:     "Coinbase",
		Currency:     body.Data.Currency,
		CurrentPrice: price,
	}, nil
}

func (p *CoinbaseProvider) Quotes(
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

func (p *CoinbaseProvider) HistoricalQuote(
	_ context.Context,
	_ string,
	_ string,
	_ time.Time,
	_ time.Time,
) (*HistoricalQuoteResult, error) {
	return nil, errors.New(
		"coinbase v2 spot provider does not support historical quotes",
	)
}
