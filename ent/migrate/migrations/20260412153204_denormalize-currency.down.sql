-- reverse: modify "transaction_entries" table
ALTER TABLE "transaction_entries" DROP CONSTRAINT "transaction_entries_household_currencies_transaction_entries", DROP COLUMN "household_currency_id", ALTER COLUMN "currency_id" SET NOT NULL, ADD CONSTRAINT "transaction_entries_currencies_transaction_entries" FOREIGN KEY ("currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- reverse: create index "snapshotrate_snapshot_id_from__1846d55072424d4921c7baaaebcb980d" to table: "snapshot_rates"
DROP INDEX "snapshotrate_snapshot_id_from__1846d55072424d4921c7baaaebcb980d";
-- reverse: modify "snapshot_rates" table
ALTER TABLE "snapshot_rates" DROP CONSTRAINT "snapshot_rates_household_currencies_snapshot_rates_to", DROP CONSTRAINT "snapshot_rates_household_currencies_snapshot_rates_from", DROP COLUMN "to_household_currency_id", DROP COLUMN "from_household_currency_id", ALTER COLUMN "to_currency_id" SET NOT NULL, ALTER COLUMN "from_currency_id" SET NOT NULL, ADD CONSTRAINT "snapshot_rates_currencies_snapshot_rates_to" FOREIGN KEY ("to_currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION, ADD CONSTRAINT "snapshot_rates_currencies_snapshot_rates_from" FOREIGN KEY ("from_currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- reverse: drop index "snapshotrate_snapshot_id_from_currency_id_to_currency_id" from table: "snapshot_rates"
CREATE UNIQUE INDEX "snapshotrate_snapshot_id_from_currency_id_to_currency_id" ON "snapshot_rates" ("snapshot_id", "from_currency_id", "to_currency_id");
-- reverse: create index "snapshotentry_snapshot_id_user_id_household_currency_id" to table: "snapshot_entries"
DROP INDEX "snapshotentry_snapshot_id_user_id_household_currency_id";
-- reverse: modify "snapshot_entries" table
ALTER TABLE "snapshot_entries" DROP CONSTRAINT "snapshot_entries_household_currencies_snapshot_entries", DROP COLUMN "household_currency_id", ALTER COLUMN "currency_id" SET NOT NULL, ADD CONSTRAINT "snapshot_entries_currencies_snapshot_entries" FOREIGN KEY ("currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- reverse: drop index "snapshotentry_snapshot_id_user_id_currency_id" from table: "snapshot_entries"
CREATE UNIQUE INDEX "snapshotentry_snapshot_id_user_id_currency_id" ON "snapshot_entries" ("snapshot_id", "user_id", "currency_id");
-- reverse: modify "recurring_subscriptions" table
ALTER TABLE "recurring_subscriptions" DROP CONSTRAINT "recurring_subscriptions_househ_62e2489d0034fd1658105c7aa8312b15", DROP COLUMN "household_currency_id", ALTER COLUMN "currency_id" SET NOT NULL, ADD CONSTRAINT "recurring_subscriptions_currencies_recurring_subscriptions" FOREIGN KEY ("currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- reverse: modify "investments" table
ALTER TABLE "investments" DROP CONSTRAINT "investments_household_currencies_investments", DROP COLUMN "household_currency_id", ALTER COLUMN "currency_id" SET NOT NULL, ADD CONSTRAINT "investments_currencies_investments" FOREIGN KEY ("currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- reverse: create index "householdrate_household_id_fro_0bd073a98d92b2135716a4b1e7b390c4" to table: "household_rates"
DROP INDEX "householdrate_household_id_fro_0bd073a98d92b2135716a4b1e7b390c4";
-- reverse: modify "household_rates" table
ALTER TABLE "household_rates" DROP CONSTRAINT "household_rates_household_currencies_household_rates_to", DROP CONSTRAINT "household_rates_household_currencies_household_rates_from", DROP COLUMN "to_household_currency_id", DROP COLUMN "from_household_currency_id", ALTER COLUMN "to_currency_id" SET NOT NULL, ALTER COLUMN "from_currency_id" SET NOT NULL, ADD CONSTRAINT "household_rates_currencies_household_rates_to" FOREIGN KEY ("to_currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION, ADD CONSTRAINT "household_rates_currencies_household_rates_from" FOREIGN KEY ("from_currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- reverse: drop index "householdrate_household_id_from_currency_id_to_currency_id" from table: "household_rates"
CREATE UNIQUE INDEX "householdrate_household_id_from_currency_id_to_currency_id" ON "household_rates" ("household_id", "from_currency_id", "to_currency_id");
-- reverse: modify "accounts" table
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_household_currencies_accounts", DROP COLUMN "household_currency_id", ALTER COLUMN "currency_id" SET NOT NULL, ADD CONSTRAINT "accounts_currencies_accounts" FOREIGN KEY ("currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- reverse: modify "households" table
ALTER TABLE "households" DROP COLUMN "currency_code", ALTER COLUMN "currency_id" SET NOT NULL, ADD CONSTRAINT "households_currencies_households" FOREIGN KEY ("currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- reverse: create index "householdcurrency_household_id_code" to table: "household_currencies"
DROP INDEX "householdcurrency_household_id_code";
-- reverse: modify "household_currencies" table
ALTER TABLE "household_currencies" DROP COLUMN "code", ALTER COLUMN "currency_id" SET NOT NULL, ADD CONSTRAINT "household_currencies_currencies_household_currencies" FOREIGN KEY ("currency_id") REFERENCES "currencies" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- reverse: drop index "householdcurrency_household_id_currency_id" from table: "household_currencies"
CREATE UNIQUE INDEX "householdcurrency_household_id_currency_id" ON "household_currencies" ("household_id", "currency_id");
