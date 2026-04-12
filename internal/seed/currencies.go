package seed

import (
	"context"
	"log/slog"

	"beavermoney.app/ent"
)

// setupCurrencies is a no-op now. Currency data is hardcoded in
// internal/currencies/currencies.go. HouseholdCurrencies are created
// per-household during household creation.
func setupCurrencies(
	_ context.Context,
	_ *ent.Client,
	logger *slog.Logger,
) error {
	logger.Info("Currencies are hardcoded, no DB setup needed")
	return nil
}
