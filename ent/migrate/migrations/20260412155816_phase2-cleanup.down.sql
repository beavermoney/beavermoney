-- reverse: modify "transaction_entries" table
ALTER TABLE "transaction_entries" ALTER COLUMN "household_currency_id" DROP NOT NULL, ADD COLUMN "currency_id" bigint NULL;
-- reverse: modify "snapshot_rates" table
ALTER TABLE "snapshot_rates" ALTER COLUMN "to_household_currency_id" DROP NOT NULL, ALTER COLUMN "from_household_currency_id" DROP NOT NULL, ADD COLUMN "to_currency_id" bigint NULL, ADD COLUMN "from_currency_id" bigint NULL;
-- reverse: modify "snapshot_entries" table
ALTER TABLE "snapshot_entries" ALTER COLUMN "household_currency_id" DROP NOT NULL, ADD COLUMN "currency_id" bigint NULL;
-- reverse: modify "recurring_subscriptions" table
ALTER TABLE "recurring_subscriptions" ALTER COLUMN "household_currency_id" DROP NOT NULL, ADD COLUMN "currency_id" bigint NULL;
-- reverse: modify "investments" table
ALTER TABLE "investments" ALTER COLUMN "household_currency_id" DROP NOT NULL, ADD COLUMN "currency_id" bigint NULL;
-- reverse: modify "households" table
ALTER TABLE "households" ALTER COLUMN "currency_code" DROP NOT NULL, ADD COLUMN "currency_id" bigint NULL;
-- reverse: modify "household_rates" table
ALTER TABLE "household_rates" ALTER COLUMN "to_household_currency_id" DROP NOT NULL, ALTER COLUMN "from_household_currency_id" DROP NOT NULL, ADD COLUMN "to_currency_id" bigint NULL, ADD COLUMN "from_currency_id" bigint NULL;
-- reverse: modify "household_currencies" table
ALTER TABLE "household_currencies" ALTER COLUMN "code" DROP NOT NULL, ADD COLUMN "currency_id" bigint NULL;
-- reverse: modify "accounts" table
ALTER TABLE "accounts" ALTER COLUMN "household_currency_id" DROP NOT NULL, ADD COLUMN "currency_id" bigint NULL;
