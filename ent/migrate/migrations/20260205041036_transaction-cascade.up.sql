-- modify "investment_lots" table
ALTER TABLE "investment_lots" DROP CONSTRAINT "investment_lots_transactions_investment_lots", ADD CONSTRAINT "investment_lots_transactions_investment_lots" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- modify "transaction_entries" table
ALTER TABLE "transaction_entries" DROP CONSTRAINT "transaction_entries_transactions_transaction_entries", ADD CONSTRAINT "transaction_entries_transactions_transaction_entries" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
