-- step 1: add nullable column so existing rows are accepted
ALTER TABLE "investments" ADD COLUMN "user_id" bigint;
-- step 2: manual backfill
-- step 3: make it non-nullable and add foreign key constraint
ALTER TABLE "investments" ALTER COLUMN "user_id" SET NOT NULL, ADD CONSTRAINT "investments_users_investments" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
