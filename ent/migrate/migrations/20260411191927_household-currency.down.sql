-- reverse: modify "user_households" table
ALTER TABLE "user_households" DROP CONSTRAINT "user_households_household_currencies_default_currency", DROP COLUMN "default_currency_id";
-- reverse: create index "householdrate_household_id_from_currency_id_to_currency_id" to table: "household_rates"
DROP INDEX "householdrate_household_id_from_currency_id_to_currency_id";
-- reverse: create "household_rates" table
DROP TABLE "household_rates";
-- reverse: create index "householdcurrency_household_id_currency_id" to table: "household_currencies"
DROP INDEX "householdcurrency_household_id_currency_id";
-- reverse: create "household_currencies" table
DROP TABLE "household_currencies";
