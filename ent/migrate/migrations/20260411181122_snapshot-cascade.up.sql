-- modify "snapshot_entries" table
ALTER TABLE "snapshot_entries" DROP CONSTRAINT "snapshot_entries_snapshots_snapshot_entries", ADD CONSTRAINT "snapshot_entries_snapshots_snapshot_entries" FOREIGN KEY ("snapshot_id") REFERENCES "snapshots" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- modify "snapshot_rates" table
ALTER TABLE "snapshot_rates" DROP CONSTRAINT "snapshot_rates_snapshots_snapshot_rates", ADD CONSTRAINT "snapshot_rates_snapshots_snapshot_rates" FOREIGN KEY ("snapshot_id") REFERENCES "snapshots" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
