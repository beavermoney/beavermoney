-- create index "transaction_category_id_datetime" to table: "transactions"
CREATE INDEX "transaction_category_id_datetime" ON "transactions" ("category_id", "datetime");
