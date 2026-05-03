-- step 1: add nullable column so existing rows are accepted
ALTER TABLE "snapshot_rates" ADD COLUMN "household_id" bigint;
-- step 2: backfill household_id from the parent snapshot
UPDATE "snapshot_rates" sr
SET "household_id" = s."household_id"
FROM "snapshots" s
WHERE s."id" = sr."snapshot_id";
-- step 3: enforce NOT NULL and add foreign key constraint
ALTER TABLE "snapshot_rates" ALTER COLUMN "household_id" SET NOT NULL, ADD CONSTRAINT "snapshot_rates_households_snapshot_rates" FOREIGN KEY ("household_id") REFERENCES "households" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
