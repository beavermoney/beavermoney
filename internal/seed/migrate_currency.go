package seed

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
)

// migrateCurrencyToHouseholdCurrency populates the new household-currency-based
// columns from the old currency_id columns. Idempotent — skips rows already populated.
// Phase 2 cleanup will drop the old columns and the currencies table.
func migrateCurrencyToHouseholdCurrency(
	ctx context.Context,
	db *sql.DB,
	logger *slog.Logger,
) error {

	steps := []struct {
		name  string
		query string
	}{
		{
			name: "household_currencies.code",
			query: `
				UPDATE household_currencies hc
				SET code = c.code
				FROM currencies c
				WHERE hc.currency_id = c.id
				  AND (hc.code IS NULL OR hc.code = '')`,
		},
		{
			name: "households.currency_code",
			query: `
				UPDATE households h
				SET currency_code = c.code
				FROM currencies c
				WHERE h.currency_id = c.id
				  AND (h.currency_code IS NULL OR h.currency_code = '')`,
		},
		{
			name: "accounts.household_currency_id",
			query: `
				UPDATE accounts a
				SET household_currency_id = hc.id
				FROM household_currencies hc
				JOIN currencies c ON hc.currency_id = c.id
				WHERE a.currency_id = c.id
				  AND hc.household_id = a.household_id
				  AND a.household_currency_id IS NULL`,
		},
		{
			name: "investments.household_currency_id",
			query: `
				UPDATE investments i
				SET household_currency_id = hc.id
				FROM household_currencies hc
				JOIN currencies c ON hc.currency_id = c.id
				WHERE i.currency_id = c.id
				  AND hc.household_id = i.household_id
				  AND i.household_currency_id IS NULL`,
		},
		{
			name: "transaction_entries.household_currency_id",
			query: `
				UPDATE transaction_entries te
				SET household_currency_id = hc.id
				FROM household_currencies hc
				JOIN currencies c ON hc.currency_id = c.id
				WHERE te.currency_id = c.id
				  AND hc.household_id = te.household_id
				  AND te.household_currency_id IS NULL`,
		},
		{
			name: "recurring_subscriptions.household_currency_id",
			query: `
				UPDATE recurring_subscriptions rs
				SET household_currency_id = hc.id
				FROM household_currencies hc
				JOIN currencies c ON hc.currency_id = c.id
				WHERE rs.currency_id = c.id
				  AND hc.household_id = rs.household_id
				  AND rs.household_currency_id IS NULL`,
		},
		{
			name: "snapshot_entries.household_currency_id",
			query: `
				UPDATE snapshot_entries se
				SET household_currency_id = hc.id
				FROM household_currencies hc
				JOIN currencies c ON hc.currency_id = c.id
				WHERE se.currency_id = c.id
				  AND hc.household_id = se.household_id
				  AND se.household_currency_id IS NULL`,
		},
		{
			name: "household_rates.from_household_currency_id",
			query: `
				UPDATE household_rates hr
				SET from_household_currency_id = hc.id
				FROM household_currencies hc
				JOIN currencies c ON hc.currency_id = c.id
				WHERE hr.from_currency_id = c.id
				  AND hc.household_id = hr.household_id
				  AND hr.from_household_currency_id IS NULL`,
		},
		{
			name: "household_rates.to_household_currency_id",
			query: `
				UPDATE household_rates hr
				SET to_household_currency_id = hc.id
				FROM household_currencies hc
				JOIN currencies c ON hc.currency_id = c.id
				WHERE hr.to_currency_id = c.id
				  AND hc.household_id = hr.household_id
				  AND hr.to_household_currency_id IS NULL`,
		},
		{
			name: "snapshot_rates.from_household_currency_id",
			query: `
				UPDATE snapshot_rates sr
				SET from_household_currency_id = hc.id
				FROM snapshots s
				JOIN household_currencies hc ON hc.household_id = s.household_id
				JOIN currencies c ON hc.currency_id = c.id
				WHERE sr.snapshot_id = s.id
				  AND sr.from_currency_id = c.id
				  AND sr.from_household_currency_id IS NULL`,
		},
		{
			name: "snapshot_rates.to_household_currency_id",
			query: `
				UPDATE snapshot_rates sr
				SET to_household_currency_id = hc.id
				FROM snapshots s
				JOIN household_currencies hc ON hc.household_id = s.household_id
				JOIN currencies c ON hc.currency_id = c.id
				WHERE sr.snapshot_id = s.id
				  AND sr.to_currency_id = c.id
				  AND sr.to_household_currency_id IS NULL`,
		},
	}

	for _, step := range steps {
		result, err := db.ExecContext(ctx, step.query)
		if err != nil {
			return fmt.Errorf("migration step %q failed: %w", step.name, err)
		}
		rows, _ := result.RowsAffected()
		if rows > 0 {
			logger.Info("Migrated", "step", step.name, "rows", rows)
		}
	}

	if err := verifyMigration(ctx, db, logger); err != nil {
		return err
	}

	logger.Info("Currency migration completed")
	return nil
}

func verifyMigration(ctx context.Context, db *sql.DB, logger *slog.Logger) error {
	checks := []struct {
		name  string
		query string
	}{
		{"accounts with null household_currency_id", "SELECT count(*) FROM accounts WHERE household_currency_id IS NULL"},
		{"investments with null household_currency_id", "SELECT count(*) FROM investments WHERE household_currency_id IS NULL"},
		{"transaction_entries with null household_currency_id", "SELECT count(*) FROM transaction_entries WHERE household_currency_id IS NULL"},
		{"household_currencies with empty code", "SELECT count(*) FROM household_currencies WHERE code IS NULL OR code = ''"},
		{"households with empty currency_code", "SELECT count(*) FROM households WHERE currency_code IS NULL OR currency_code = ''"},
	}

	for _, check := range checks {
		var count int
		if err := db.QueryRowContext(ctx, check.query).Scan(&count); err != nil {
			return fmt.Errorf("verification %q failed: %w", check.name, err)
		}
		if count > 0 {
			logger.Warn("Unmigrated rows remain", "check", check.name, "count", count)
		}
	}

	return nil
}
