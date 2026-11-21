-- Isolated compatibility database only. Reconstructs the pre-release schema,
-- inserts a legacy snapshot, then verifies the forward migration byte-for-byte.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN IF current_database() <> 'beaver_review_compat_test' THEN RAISE EXCEPTION 'test database only'; END IF; END $$;
-- Fixture reconstruction only, not a deployment rollback. Accept a copy of
-- either the old or new local schema and rebuild a pre-release test baseline.
DROP TABLE IF EXISTS snapshot_accounts, snapshot_investments;
DROP TRIGGER IF EXISTS account_identity_guard ON accounts;
DROP TRIGGER IF EXISTS investment_identity_guard ON investments;
DROP TRIGGER IF EXISTS snapshot_stamp_immutable ON snapshots;
DROP TRIGGER IF EXISTS snapshot_rate_immutable ON snapshot_rates;
DROP TRIGGER IF EXISTS snapshot_entry_immutable ON snapshot_entries;
DROP FUNCTION IF EXISTS enforce_account_identity(), enforce_investment_identity(), enforce_snapshot_stamp(), reject_snapshot_value_update();
ALTER TABLE snapshots DROP COLUMN IF EXISTS format_version;
ALTER TABLE snapshot_rates DROP COLUMN IF EXISTS as_of;
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS archived_account_empty;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS archived_investment_empty, DROP CONSTRAINT IF EXISTS manual_average_nonnegative, DROP COLUMN IF EXISTS archived;
DROP TRIGGER IF EXISTS transaction_average_review ON transactions;
DROP TRIGGER IF EXISTS investment_average_review ON investment_lots;
DROP FUNCTION IF EXISTS invalidate_transaction_average(), invalidate_investment_average();
ALTER TABLE snapshots DROP COLUMN IF EXISTS review_data;
ALTER TABLE investments DROP COLUMN IF EXISTS confirmed_average_cost, DROP COLUMN IF EXISTS average_cost_confirmed_at, DROP COLUMN IF EXISTS holdings_changed_at;

DELETE FROM snapshots;
INSERT INTO snapshots (household_id,create_time,update_time,note)
VALUES (8589934692,'2026-10-20T12:00:00Z','2026-10-20T12:00:00Z','Compatibility fixture: legacy review');
INSERT INTO snapshot_entries (create_time,update_time,household_id,snapshot_id,user_id,household_currency_id,liquidity,investment,property,receivable,liability)
SELECT s.create_time,s.create_time,a.household_id,s.id,a.user_id,a.household_currency_id,
 COALESCE(sum(a.value) FILTER(WHERE a.type='liquidity'),0),COALESCE(sum(a.value) FILTER(WHERE a.type='investment'),0),
 COALESCE(sum(a.value) FILTER(WHERE a.type='property'),0),COALESCE(sum(a.value) FILTER(WHERE a.type='receivable'),0),
 COALESCE(sum(a.value) FILTER(WHERE a.type='liability'),0)
FROM accounts a JOIN snapshots s ON s.household_id=a.household_id
WHERE NOT a.archived GROUP BY a.household_id,s.id,s.create_time,a.user_id,a.household_currency_id;
INSERT INTO snapshot_rates (household_id,snapshot_id,from_household_currency_id,to_household_currency_id,rate,create_time,update_time)
SELECT r.household_id,s.id,r.from_household_currency_id,r.to_household_currency_id,r.rate,s.create_time,s.create_time
FROM household_rates r JOIN snapshots s ON s.household_id=r.household_id;
CREATE TEMP TABLE prior_entries AS SELECT * FROM snapshot_entries;
CREATE TEMP TABLE prior_rates AS SELECT * FROM snapshot_rates;
CREATE TEMP TABLE prior_snapshots AS SELECT id,create_time,update_time,household_id,note FROM snapshots;
\ir ../../ent/migrate/migrations/20261121120000_review-history.up.sql

DO $$ BEGIN
 IF EXISTS ((SELECT * FROM snapshot_entries EXCEPT SELECT * FROM prior_entries) UNION ALL (SELECT * FROM prior_entries EXCEPT SELECT * FROM snapshot_entries)) THEN RAISE EXCEPTION 'legacy entries changed'; END IF;
 IF EXISTS ((SELECT * FROM snapshot_rates EXCEPT SELECT * FROM prior_rates) UNION ALL (SELECT * FROM prior_rates EXCEPT SELECT * FROM snapshot_rates)) THEN RAISE EXCEPTION 'legacy rates changed'; END IF;
 IF EXISTS ((SELECT id,create_time,update_time,household_id,note FROM snapshots EXCEPT SELECT * FROM prior_snapshots) UNION ALL (SELECT * FROM prior_snapshots EXCEPT SELECT id,create_time,update_time,household_id,note FROM snapshots)) THEN RAISE EXCEPTION 'legacy metadata changed'; END IF;
 IF EXISTS(SELECT 1 FROM snapshots WHERE review_data IS NOT NULL) THEN RAISE EXCEPTION 'fabricated legacy details'; END IF;
 IF EXISTS(SELECT 1 FROM investments WHERE confirmed_average_cost IS NOT NULL OR average_cost_confirmed_at IS NOT NULL) THEN RAISE EXCEPTION 'fabricated confirmations'; END IF;
END $$;
-- Two identical interim JSON captures prove the normalization migration reuses
-- unchanged observations and carries FX timestamps into the relational table.
INSERT INTO snapshots(household_id,create_time,update_time,note,review_data)
SELECT 8589934692,stamp,stamp,'Compatibility fixture: prototype review',
 jsonb_build_object('version',2,'complete',true,
 'activeAccountIds',(SELECT jsonb_agg(id) FROM accounts WHERE household_id=8589934692 AND NOT archived),
 'accounts',(SELECT jsonb_agg(jsonb_build_object('id',a.id,'cash',a.balance::text,'holdings',
   (SELECT COALESCE(jsonb_agg(jsonb_build_object('id',i.id,'quantity',i.amount::text,'price',i.quote::text,'average',NULL,'confirmedAt',NULL,'needsReview',i.amount<>0)),'[]') FROM investments i WHERE i.account_id=a.id)))
   FROM accounts a WHERE a.household_id=8589934692 AND NOT a.archived),
 'rates',(SELECT jsonb_agg(jsonb_build_object('from',f.code,'to',t.code,'rate',r.rate::text,'asOf',r.update_time)) FROM household_rates r JOIN household_currencies f ON f.id=r.from_household_currency_id JOIN household_currencies t ON t.id=r.to_household_currency_id WHERE r.household_id=8589934692 AND f.id<>t.id)
 )::text
FROM (VALUES ('2026-11-01T12:00:00Z'::timestamptz),('2026-11-02T12:00:00Z'::timestamptz)) stamps(stamp);
INSERT INTO snapshot_rates(household_id,snapshot_id,from_household_currency_id,to_household_currency_id,rate,create_time,update_time)
SELECT r.household_id,s.id,r.from_household_currency_id,r.to_household_currency_id,r.rate,s.create_time,s.create_time
FROM household_rates r JOIN snapshots s ON s.household_id=r.household_id
WHERE s.review_data IS NOT NULL AND r.from_household_currency_id<>r.to_household_currency_id;
\ir ../../ent/migrate/migrations/20261121160000_normalized-snapshots.up.sql
DO $$ BEGIN
 IF (SELECT count(*) FROM snapshot_accounts)<>(SELECT count(*) FROM accounts WHERE household_id=8589934692 AND NOT archived) THEN RAISE EXCEPTION 'account backfill not deduplicated'; END IF;
 IF (SELECT count(*) FROM snapshot_investments)<>(SELECT count(*) FROM investments i JOIN accounts a ON a.id=i.account_id WHERE a.household_id=8589934692 AND NOT a.archived) THEN RAISE EXCEPTION 'investment backfill not deduplicated'; END IF;
 IF EXISTS(SELECT 1 FROM snapshot_accounts s JOIN accounts a ON a.id=s.account_id WHERE s.balance<>a.balance) THEN RAISE EXCEPTION 'backfill changed cash'; END IF;
 IF EXISTS(SELECT 1 FROM snapshot_investments s JOIN investments i ON i.id=s.investment_id WHERE s.quantity<>i.amount OR s.market_price<>i.quote OR s.average_cost IS NOT NULL) THEN RAISE EXCEPTION 'backfill changed holdings'; END IF;
 IF EXISTS(SELECT 1 FROM snapshot_rates r JOIN snapshots s ON s.id=r.snapshot_id WHERE s.format_version=1 AND r.as_of IS NULL) THEN RAISE EXCEPTION 'lost FX source timestamp'; END IF;
 IF EXISTS(SELECT 1 FROM snapshot_entries e FULL JOIN prior_entries p ON p.id=e.id WHERE p IS DISTINCT FROM e) THEN RAISE EXCEPTION 'legacy entries changed during normalization'; END IF;
 IF EXISTS(SELECT 1 FROM prior_rates p LEFT JOIN snapshot_rates r ON r.id=p.id WHERE p.rate IS DISTINCT FROM r.rate OR p.snapshot_id IS DISTINCT FROM r.snapshot_id OR p.from_household_currency_id IS DISTINCT FROM r.from_household_currency_id OR p.to_household_currency_id IS DISTINCT FROM r.to_household_currency_id) THEN RAISE EXCEPTION 'legacy FX changed during normalization'; END IF;
 IF EXISTS(SELECT 1 FROM prior_snapshots p LEFT JOIN snapshots s ON s.id=p.id WHERE p.note IS DISTINCT FROM s.note OR p.create_time IS DISTINCT FROM s.create_time OR s.format_version<>0) THEN RAISE EXCEPTION 'legacy stamp changed during normalization'; END IF;
END $$;
\ir ../../ent/migrate/migrations/20261121170000_snapshot-capture-times.up.sql
\ir ../../ent/migrate/migrations/20261121180000_monotonic-average-review.up.sql
UPDATE households SET is_demo=false WHERE id=8589934692;
SELECT NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='merchants') AS needs_merchants \gset
\if :needs_merchants
\ir ../../ent/migrate/migrations/20261121190000_merchants.up.sql
\endif
UPDATE schema_migrations SET version=20261121190000,dirty=false;
COMMIT;
SELECT 'PASS: old snapshot values, FX, metadata and notes survived the forward migration exactly';
