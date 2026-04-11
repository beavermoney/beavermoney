-- reverse: modify "recurring_subscriptions" table
ALTER TABLE "recurring_subscriptions" ADD COLUMN "fx_rate" numeric(36,18) NOT NULL;
-- reverse: modify "accounts" table
ALTER TABLE "accounts" ADD COLUMN "fx_rate" numeric(36,18) NOT NULL;
