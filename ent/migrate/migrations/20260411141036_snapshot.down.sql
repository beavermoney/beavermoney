-- reverse: create index "snapshotentry_snapshot_id_user_id_currency_id" to table: "snapshot_entries"
DROP INDEX "snapshotentry_snapshot_id_user_id_currency_id";
-- reverse: create index "snapshotentry_snapshot_id" to table: "snapshot_entries"
DROP INDEX "snapshotentry_snapshot_id";
-- reverse: create "snapshot_entries" table
DROP TABLE "snapshot_entries";
-- reverse: create index "snapshot_household_id_create_time" to table: "snapshots"
DROP INDEX "snapshot_household_id_create_time";
-- reverse: create "snapshots" table
DROP TABLE "snapshots";
