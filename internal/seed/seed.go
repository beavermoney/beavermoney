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

	logger.Info("Database setup completed successfully")
	return nil
}
