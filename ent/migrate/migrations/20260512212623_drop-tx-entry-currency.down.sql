-- reverse: modify "transaction_entries" table
ALTER TABLE "transaction_entries" ADD COLUMN "household_currency_id" bigint NOT NULL;
