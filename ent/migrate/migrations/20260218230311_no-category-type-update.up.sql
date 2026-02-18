-- modify "transactions" table
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_transaction_categories_transactions", ADD CONSTRAINT "transactions_transaction_categories_transactions" FOREIGN KEY ("category_id") REFERENCES "transaction_categories" ("id") ON UPDATE NO ACTION ON DELETE RESTRICT;
