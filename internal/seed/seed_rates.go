package seed

import (
	"context"
	"fmt"
	"log/slog"

	"beavermoney.app/ent"
	"beavermoney.app/ent/householdcurrency"
	"beavermoney.app/internal/contextkeys"
	"beavermoney.app/internal/frankfurter"
)

// seedHouseholdRates ensures every household with 2+ currencies has
// exchange rates for all currency pairs. Idempotent — existing rates
// are kept via ON CONFLICT IGNORE.
func seedHouseholdRates(
	ctx context.Context,
	client *ent.Client,
	frankfurterClient *frankfurter.ClientWithResponses,
	logger *slog.Logger,
) error {
	bypassCtx := contextkeys.NewPrivacyBypassContext(ctx)

	households, err := client.Household.Query().All(bypassCtx)
	if err != nil {
		return fmt.Errorf("failed to query households: %w", err)
	}

	for _, hh := range households {
		hhCtx := context.WithValue(bypassCtx, contextkeys.HouseholdIDKey(), hh.ID)

		currencies, err := client.HouseholdCurrency.Query().
			Where(householdcurrency.HouseholdIDEQ(hh.ID)).
			All(hhCtx)
		if err != nil {
			return fmt.Errorf("failed to query currencies for household %d: %w", hh.ID, err)
		}
		if len(currencies) < 2 {
			continue
		}

		mc := make([]migrateCurrency, len(currencies))
		for i, c := range currencies {
			mc[i] = migrateCurrency{ID: c.ID, Code: c.Code}
		}

		if err := populateHouseholdRates(hhCtx, client, frankfurterClient, hh.ID, mc); err != nil {
			return fmt.Errorf("failed to seed rates for household %d: %w", hh.ID, err)
		}

		logger.Info("Household rates seeded", "householdID", hh.ID, "pairs", len(currencies)*(len(currencies)-1))
	}

	return nil
}
