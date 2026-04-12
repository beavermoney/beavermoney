-- reverse: modify "user_households" table
ALTER TABLE "user_households" DROP CONSTRAINT "user_households_household_currencies_household_currency", DROP COLUMN "household_currency_id";
