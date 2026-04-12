-- modify "user_households" table
ALTER TABLE "user_households" DROP COLUMN "default_currency_id", ALTER COLUMN "household_currency_id" SET NOT NULL, ADD CONSTRAINT "user_households_household_currencies_household_currency" FOREIGN KEY ("household_currency_id") REFERENCES "household_currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
