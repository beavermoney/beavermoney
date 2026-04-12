package seed

import (
	"context"
	"log/slog"

	"beavermoney.app/ent"
	"beavermoney.app/internal/frankfurter"
)

func Setup(
	ctx context.Context,
	client *ent.Client,
	frankfurterClient *frankfurter.ClientWithResponses,
	logger *slog.Logger,
) error {
	logger.Info("Running database setup")

	if err := migrateHouseholdCurrencies(ctx, client, frankfurterClient, logger); err != nil {
		return err
	}

	if err := seedHouseholdRates(ctx, client, frankfurterClient, logger); err != nil {
		return err
	}

	logger.Info("Database setup completed successfully")
	return nil
}
