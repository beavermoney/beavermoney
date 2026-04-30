-- reverse: create index "userhousehold_user_id_household_id" to table: "user_households"
DROP INDEX "userhousehold_user_id_household_id";
-- reverse: drop index "userhousehold_household_id_user_id" from table: "user_households"
CREATE UNIQUE INDEX "userhousehold_household_id_user_id" ON "user_households" ("household_id", "user_id");
-- reverse: create index "transaction_household_id_user_id_datetime" to table: "transactions"
DROP INDEX "transaction_household_id_user_id_datetime";
-- reverse: create index "recurringsubscription_household_id_user_id" to table: "recurring_subscriptions"
DROP INDEX "recurringsubscription_household_id_user_id";
-- reverse: create index "investment_household_id_user_id" to table: "investments"
DROP INDEX "investment_household_id_user_id";
-- reverse: create index "account_household_id_user_id" to table: "accounts"
DROP INDEX "account_household_id_user_id";
