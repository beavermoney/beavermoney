BEGIN;
INSERT INTO users(id,create_time,update_time,email,name,is_synthetic) VALUES
 (21474836580,now(),now(),'review-admin@example.test','Review Admin',false),
 (21474836581,now(),now(),'review-member@example.test','Review Member',false);
INSERT INTO households(id,create_time,update_time,name,locale,is_demo)
 VALUES(8589934692,now(),now(),'Snapshot compatibility fixture','en-CA',false);
INSERT INTO household_currencies(id,create_time,update_time,household_id,code,important) VALUES
 (73014444132,now(),now(),8589934692,'CAD',true),
 (73014444133,now(),now(),8589934692,'USD',true);
INSERT INTO user_households(create_time,update_time,household_id,user_id,role,household_currency_id) VALUES
 (now(),now(),8589934692,21474836580,'admin',73014444132),
 (now(),now(),8589934692,21474836581,'member',73014444132);
INSERT INTO household_rates(create_time,update_time,household_id,from_household_currency_id,to_household_currency_id,rate) VALUES
 (now(),now(),8589934692,73014444132,73014444133,0.729927007299270073),
 (now(),now(),8589934692,73014444133,73014444132,1.37);
INSERT INTO accounts(id,create_time,update_time,household_id,user_id,household_currency_id,name,type,balance,value) VALUES
 (100,now(),now(),8589934692,21474836580,73014444132,'Cash CAD','liquidity',0,0),
 (101,now(),now(),8589934692,21474836580,73014444132,'Broker CAD','investment',0,0),
 (102,now(),now(),8589934692,21474836581,73014444133,'Cash USD','liquidity',0,0);
INSERT INTO transaction_categories(id,create_time,update_time,household_id,name,type,icon) VALUES
 (38654705764,now(),now(),8589934692,'Income','income','wallet'),
 (38654705765,now(),now(),8589934692,'Trade','investment','chart-line');
INSERT INTO transactions(id,create_time,update_time,datetime,household_id,user_id,category_id) VALUES
 (12884901988,now(),now(),'2026-10-01T12:00:00Z',8589934692,21474836580,38654705764),
 (12884901989,now(),now(),'2026-10-02T12:00:00Z',8589934692,21474836580,38654705765);
INSERT INTO transaction_entries(create_time,update_time,household_id,account_id,transaction_id,amount) VALUES
 (now(),now(),8589934692,100,12884901988,100),
 (now(),now(),8589934692,101,12884901988,20),
 (now(),now(),8589934692,102,12884901988,50);
INSERT INTO investments(id,create_time,update_time,household_id,user_id,account_id,household_currency_id,name,type,symbol,amount,quote,value)
 VALUES(30064771172,now(),now(),8589934692,21474836580,101,73014444132,'Fixture Shares','stock','FIXTURE',0,12,0);
INSERT INTO investment_lots(create_time,update_time,household_id,investment_id,transaction_id,amount,price)
 VALUES(now(),now(),8589934692,30064771172,12884901989,10,7);
-- Real legacy history exists before the server's migration runner upgrades it.
INSERT INTO snapshots(household_id,create_time,update_time,note)
 VALUES(8589934692,'2026-10-20T12:00:00Z','2026-10-20T12:00:00Z','Compatibility fixture: legacy review');
INSERT INTO snapshot_entries(create_time,update_time,household_id,snapshot_id,user_id,household_currency_id,liquidity,investment,property,receivable,liability)
 SELECT s.create_time,s.create_time,a.household_id,s.id,a.user_id,a.household_currency_id,
 COALESCE(sum(a.value) FILTER(WHERE a.type='liquidity'),0),
 COALESCE(sum(a.value) FILTER(WHERE a.type='investment'),0),0,0,0
 FROM accounts a JOIN snapshots s ON s.household_id=a.household_id
 GROUP BY a.household_id,s.id,s.create_time,a.user_id,a.household_currency_id;
INSERT INTO snapshot_rates(household_id,snapshot_id,from_household_currency_id,to_household_currency_id,rate,create_time,update_time)
 SELECT r.household_id,s.id,r.from_household_currency_id,r.to_household_currency_id,r.rate,s.create_time,s.create_time
 FROM household_rates r JOIN snapshots s ON s.household_id=r.household_id;
-- Explicit fixture IDs must not collide with later generated IDs.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['users','households','household_currencies','accounts','transaction_categories','transactions','investments'] LOOP
  EXECUTE format('SELECT setval(pg_get_serial_sequence(%L,''id''),max(id),true) FROM %I',t,t);
 END LOOP;
END $$;
COMMIT;
