-- modify "transactions" table
ALTER TABLE "transactions" ADD COLUMN "pending" boolean NOT NULL DEFAULT false;
