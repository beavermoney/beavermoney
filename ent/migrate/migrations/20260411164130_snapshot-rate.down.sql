-- reverse: create index "snapshotrate_snapshot_id_from_currency_id_to_currency_id" to table: "snapshot_rates"
DROP INDEX "snapshotrate_snapshot_id_from_currency_id_to_currency_id";
-- reverse: create index "snapshotrate_snapshot_id" to table: "snapshot_rates"
DROP INDEX "snapshotrate_snapshot_id";
-- reverse: create "snapshot_rates" table
DROP TABLE "snapshot_rates";
