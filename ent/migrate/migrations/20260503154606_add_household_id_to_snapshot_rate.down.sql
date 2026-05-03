-- reverse: modify "snapshot_rates" table
ALTER TABLE "snapshot_rates" DROP CONSTRAINT "snapshot_rates_households_snapshot_rates", DROP COLUMN "household_id";
