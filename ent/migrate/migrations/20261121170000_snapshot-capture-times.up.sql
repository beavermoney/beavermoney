-- Each full-household review has one capture time. Capture serialization and
-- this constraint make an additional revision/tie-breaker unnecessary.
CREATE UNIQUE INDEX snapshot_household_capture_time
 ON snapshots(household_id,create_time) WHERE format_version=1;
ALTER TABLE snapshot_accounts RENAME COLUMN observed_at TO create_time;
ALTER TABLE snapshot_accounts DROP COLUMN revision;
CREATE UNIQUE INDEX snapshotaccount_household_id_account_id_create_time
 ON snapshot_accounts(household_id,account_id,create_time DESC);
ALTER TABLE snapshot_investments RENAME COLUMN observed_at TO create_time;
ALTER TABLE snapshot_investments DROP COLUMN revision;
CREATE UNIQUE INDEX snapshotinvestment_household_id_investment_id_create_time
 ON snapshot_investments(household_id,investment_id,create_time DESC);
-- The saved FX value is sufficient for historical conversion. Its capture time
-- is already available from the snapshot and the rate's existing create_time.
ALTER TABLE snapshot_rates DROP COLUMN as_of;
