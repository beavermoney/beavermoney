// Package stock provides a client for fetching real-time and historical
// stock, ETF and index quotes from a configurable provider backend.
package stock

import (
	"context"
	"time"

	"github.com/samber/lo"
	"github.com/shopspring/decimal"
)

type Provider interface {
	Quote(
		ctx context.Context,
		symbol string,
	) (*QuoteResult, error)

	Quotes(
		ctx context.Context,
		symbols []string,
	) (map[string]*QuoteResult, error)

	HistoricalQuote(
		ctx context.Context,
		symbol string,
		period string,
		from time.Time,
		to time.Time,
	) (*HistoricalQuoteResult, error)
}

type QuoteResult struct {
	Symbol       string
	Name         string
	Exchange     string
	Currency     string
	CurrentPrice decimal.Decimal
}

type HistoricalDataPoint struct {
	Date  time.Time
	Close decimal.Decimal
}

type HistoricalQuoteResult struct {
	Symbol   string
	Period   string
	Data     []HistoricalDataPoint
	Metadata struct {
		Name     string
		Exchange string
		Currency string
	}
}

type Client struct {
	provider Provider
}

func NewClient(provider Provider) *Client {
	return &Client{provider: provider}
}

func (c *Client) Quote(
	ctx context.Context,
	symbol string,
) (*QuoteResult, error) {
	return c.provider.Quote(ctx, symbol)
}

func (c *Client) Quotes(
	ctx context.Context,
	symbols []string,
) (map[string]*QuoteResult, error) {
	return c.provider.Quotes(ctx, lo.Uniq(symbols))
}

func (c *Client) HistoricalQuote(
	ctx context.Context,
	symbol string,
	period string,
	from time.Time,
	to time.Time,
) (*HistoricalQuoteResult, error) {
	return c.provider.HistoricalQuote(ctx, symbol, period, from, to)
}
