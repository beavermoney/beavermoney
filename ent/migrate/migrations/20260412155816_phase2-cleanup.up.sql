-- modify "accounts" table
ALTER TABLE "accounts" DROP COLUMN "currency_id", ALTER COLUMN "household_currency_id" SET NOT NULL;
-- modify "household_currencies" table
ALTER TABLE "household_currencies" DROP COLUMN "currency_id", ALTER COLUMN "code" SET NOT NULL;
-- modify "household_rates" table
ALTER TABLE "household_rates" DROP COLUMN "from_currency_id", DROP COLUMN "to_currency_id", ALTER COLUMN "from_household_currency_id" SET NOT NULL, ALTER COLUMN "to_household_currency_id" SET NOT NULL;
-- modify "households" table
ALTER TABLE "households" DROP COLUMN "currency_id", ALTER COLUMN "currency_code" SET NOT NULL;
-- modify "investments" table
ALTER TABLE "investments" DROP COLUMN "currency_id", ALTER COLUMN "household_currency_id" SET NOT NULL;
-- modify "recurring_subscriptions" table
ALTER TABLE "recurring_subscriptions" DROP COLUMN "currency_id", ALTER COLUMN "household_currency_id" SET NOT NULL;
-- modify "snapshot_entries" table
ALTER TABLE "snapshot_entries" DROP COLUMN "currency_id", ALTER COLUMN "household_currency_id" SET NOT NULL;
-- modify "snapshot_rates" table
ALTER TABLE "snapshot_rates" DROP COLUMN "from_currency_id", DROP COLUMN "to_currency_id", ALTER COLUMN "from_household_currency_id" SET NOT NULL, ALTER COLUMN "to_household_currency_id" SET NOT NULL;
-- modify "transaction_entries" table
ALTER TABLE "transaction_entries" DROP COLUMN "currency_id", ALTER COLUMN "household_currency_id" SET NOT NULL;
-- drop legacy "currencies" table (no longer referenced)
DROP TABLE IF EXISTS "currencies";
