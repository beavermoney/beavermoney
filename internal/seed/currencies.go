package seed

import (
	"context"
	"log/slog"

	"beavermoney.app/ent"
	"beavermoney.app/ent/currency"
	"entgo.io/ent/dialect/sql"
)

// CurrencyWithLocales represents a currency code with its associated locales.
type CurrencyWithLocales struct {
	Code    string
	Locales []string
}

// StandardCurrencies is a list of the 10 most popular currencies
// with their associated locales.
var StandardCurrencies = []CurrencyWithLocales{
	{Code: "USD", Locales: []string{"en-US"}},
	{
		Code:    "EUR",
		Locales: []string{"de-DE", "fr-FR", "es-ES", "it-IT", "nl-NL"},
	},
	{Code: "GBP", Locales: []string{"en-GB"}},
	{Code: "JPY", Locales: []string{"ja-JP"}},
	{Code: "CNY", Locales: []string{"zh-CN"}},
	{Code: "CAD", Locales: []string{"en-CA", "fr-CA"}},
	{Code: "AUD", Locales: []string{"en-AU"}},
	{Code: "KRW", Locales: []string{"ko-KR"}},
	{Code: "INR", Locales: []string{"en-IN", "hi-IN"}},
	{Code: "BRL", Locales: []string{"pt-BR"}},
}

// setupCurrencies ensures all standard currencies exist in the database.
// Uses an upsert pattern to avoid duplicates and be idempotent.
func setupCurrencies(
	ctx context.Context,
	client *ent.Client,
	logger *slog.Logger,
) error {
	logger.Info("Setting up currencies", "count", len(StandardCurrencies))

	// Batch create/upsert currencies
	bulk := make([]*ent.CurrencyCreate, len(StandardCurrencies))
	for i, curr := range StandardCurrencies {
		bulk[i] = client.Currency.Create().
			SetCode(curr.Code).
			SetLocales(curr.Locales)
	}

	err := client.Currency.CreateBulk(bulk...).
		OnConflict(
			sql.ConflictColumns(currency.FieldCode),
		).
		Ignore().
		Exec(ctx)
	if err != nil {
		logger.Error("Failed to setup currencies", "error", err)
		return err
	}

	logger.Info("Currencies setup completed", "count", len(StandardCurrencies))
	return nil
}
