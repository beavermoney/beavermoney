-- modify "accounts" table
ALTER TABLE "accounts" DROP COLUMN "fx_rate";
-- modify "recurring_subscriptions" table
ALTER TABLE "recurring_subscriptions" DROP COLUMN "fx_rate";
