-- create index "account_household_id_user_id" to table: "accounts"
CREATE INDEX "account_household_id_user_id" ON "accounts" ("household_id", "user_id");
-- create index "investment_household_id_user_id" to table: "investments"
CREATE INDEX "investment_household_id_user_id" ON "investments" ("household_id", "user_id");
-- create index "recurringsubscription_household_id_user_id" to table: "recurring_subscriptions"
CREATE INDEX "recurringsubscription_household_id_user_id" ON "recurring_subscriptions" ("household_id", "user_id");
-- create index "transaction_household_id_user_id_datetime" to table: "transactions"
CREATE INDEX "transaction_household_id_user_id_datetime" ON "transactions" ("household_id", "user_id", "datetime");
-- drop index "userhousehold_household_id_user_id" from table: "user_households"
DROP INDEX "userhousehold_household_id_user_id";
-- create index "userhousehold_user_id_household_id" to table: "user_households"
CREATE UNIQUE INDEX "userhousehold_user_id_household_id" ON "user_households" ("user_id", "household_id");
