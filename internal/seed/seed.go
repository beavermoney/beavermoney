package seed

import (
	"context"
	"database/sql"
	"log/slog"

	"beavermoney.app/ent"
	"beavermoney.app/internal/frankfurter"
)

func Setup(
	ctx context.Context,
	client *ent.Client,
	db *sql.DB,
	frankfurterClient *frankfurter.ClientWithResponses,
	logger *slog.Logger,
) error {
	logger.Info("Running database setup")

	if err := setupCurrencies(ctx, client, logger); err != nil {
		return err
	}

	if err := migrateCurrencyToHouseholdCurrency(ctx, db, logger); err != nil {
		return err
	}

	if err := migrateHouseholdCurrencies(ctx, client, frankfurterClient, logger); err != nil {
		return err
	}

	logger.Info("Database setup completed successfully")
	return nil
}
