// Bootstrap a disposable PostgreSQL fixture without local preview data or network APIs.
package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"beavermoney.app/cmd/server/database"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
)

func main() {
	if err := run(); err != nil {
		slog.Error("snapshot test setup failed", "error", err)
		os.Exit(1)
	}
}

func run() error {
	dsn := os.Getenv("REVIEW_TEST_DATABASE_URL")
	if dsn == "" {
		return fmt.Errorf("REVIEW_TEST_DATABASE_URL is required")
	}
	client, db, err := database.Connect(dsn)
	if err != nil {
		return err
	}
	defer func() { _ = client.Close() }()
	var name string
	if err := db.QueryRow("SELECT current_database()").Scan(&name); err != nil {
		return err
	}
	if name != "beaver_review_compat_test" {
		return fmt.Errorf("requires disposable beaver_review_compat_test database")
	}
	var tables int
	if err := db.QueryRow("SELECT count(*) FROM information_schema.tables WHERE table_schema='public'").Scan(&tables); err != nil {
		return err
	}
	if tables != 0 {
		return fmt.Errorf("bootstrap requires an empty database; existing data will not be replaced")
	}
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return err
	}
	runner, err := migrate.NewWithDatabaseInstance("file://ent/migrate/migrations", "postgres", driver)
	if err != nil {
		return err
	}
	// Build the actual last-shipped schema, seed historical data, then exercise
	// the same forward migration runner used by server startup.
	if err := runner.Migrate(20261117091359); err != nil {
		return err
	}
	seed, err := os.ReadFile("scripts/fixtures/review-setup/seed.sql")
	if err != nil {
		return err
	}
	if _, err := db.ExecContext(context.Background(), string(seed)); err != nil {
		return fmt.Errorf("seed old schema: %w", err)
	}
	const historyQuery = `SELECT jsonb_build_object(
 'stamps',(SELECT jsonb_agg(jsonb_build_object('id',id,'household_id',household_id,'create_time',create_time,'update_time',update_time,'note',note) ORDER BY id) FROM snapshots),
 'entries',(SELECT jsonb_agg(to_jsonb(e) ORDER BY id) FROM snapshot_entries e),
 'rates',(SELECT jsonb_agg(to_jsonb(r) ORDER BY id) FROM snapshot_rates r)
)::text`
	var before, after string
	if err := db.QueryRow(historyQuery).Scan(&before); err != nil {
		return err
	}
	if err := database.Migrate(db, slog.Default()); err != nil {
		return err
	}
	if err := db.QueryRow(historyQuery).Scan(&after); err != nil {
		return err
	}
	if before != after {
		return fmt.Errorf("forward migrations changed legacy snapshot values, FX or metadata")
	}
	slog.Info("legacy snapshot preserved by server migration runner")
	return nil
}
