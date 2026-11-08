-- Optional local UI fixtures. Run only against the isolated astryx_review database.
-- Rerunnable; never replaces existing records or touches the normal development DB.
BEGIN;
DO $$
DECLARE
  h bigint; u bigint; c bigint; usd bigint; partner bigint; snap bigint; empty_h bigint; empty_c bigint; brokerage bigint; transfer_id bigint; source_account bigint; transfer_category bigint; n integer;
BEGIN
  IF current_database() <> 'astryx_review' THEN
    RAISE EXCEPTION 'UI fixtures require the isolated astryx_review database';
  END IF;
  SELECT id INTO STRICT h FROM households WHERE name='Demo Household' AND is_demo;
  SELECT user_id INTO STRICT u FROM user_households WHERE household_id=h AND role='admin' LIMIT 1;
  SELECT id INTO STRICT c FROM household_currencies WHERE household_id=h AND code='CAD';
  SELECT id INTO STRICT usd FROM household_currencies WHERE household_id=h AND code='USD';

  INSERT INTO recurring_subscriptions(create_time,update_time,name,interval,interval_count,start_date,active,icon,cost,household_id,user_id,household_currency_id)
  SELECT now(),now(),v.name,v.period,v.count,current_date-v.age,v.active,'',v.cost,h,u,CASE WHEN v.currency='USD' THEN usd ELSE c END
  FROM (VALUES
    ('Demo · Music family plan','month',1,90,true,16.99,'CAD'),
    ('Demo · Annual cloud backup and shared photo library','year',1,200,true,119.99,'USD'),
    ('Demo · Community fitness membership','week',2,35,true,24.50,'CAD'),
    ('Demo · Paused streaming plan','month',1,70,false,9.99,'CAD')
  ) AS v(name,period,count,age,active,cost,currency)
  WHERE NOT EXISTS (SELECT 1 FROM recurring_subscriptions s WHERE s.household_id=h AND s.name=v.name);

  INSERT INTO users(create_time,update_time,name,email,is_synthetic)
  VALUES(now(),now(),'Alexandra Demo','astryx-review@example.invalid',false)
  ON CONFLICT(email) DO NOTHING;
  SELECT id INTO STRICT partner FROM users WHERE email='astryx-review@example.invalid';
  INSERT INTO user_households(create_time,update_time,role,user_id,household_id,household_currency_id)
  VALUES(now(),now(),'member',partner,h,c) ON CONFLICT(user_id,household_id) DO NOTHING;

  INSERT INTO accounts(create_time,update_time,name,type,balance,value,household_id,user_id,archived,category,household_currency_id)
  SELECT now(),now(),v.name,'liquidity',v.balance,v.balance,h,v.owner,v.archived,'Demo savings',c
  FROM (VALUES
    ('Demo · Closed travel savings account',0,u,true),
    ('Demo · Alexandra emergency savings',1250,partner,false)
  ) AS v(name,balance,owner,archived)
  WHERE NOT EXISTS(SELECT 1 FROM accounts a WHERE a.household_id=h AND a.name=v.name);

  SELECT id INTO empty_h FROM households WHERE name='UI review · Empty household';
  IF empty_h IS NULL THEN
    INSERT INTO households(create_time,update_time,name,locale,is_demo)
    VALUES(now(),now(),'UI review · Empty household','en-CA',false) RETURNING id INTO empty_h;
    INSERT INTO household_currencies(create_time,update_time,code,important,household_id)
    VALUES(now(),now(),'CAD',true,empty_h) RETURNING id INTO empty_c;
    INSERT INTO user_households(create_time,update_time,role,user_id,household_id,household_currency_id)
    VALUES(now(),now(),'admin',u,empty_h,empty_c);
  END IF;

  SELECT id INTO brokerage FROM accounts WHERE household_id=h AND name='Demo · Second brokerage';
  IF brokerage IS NULL THEN
    INSERT INTO accounts(create_time,update_time,name,type,balance,value,household_id,user_id,household_currency_id)
    VALUES(now(),now(),'Demo · Second brokerage','investment',0,0,h,u,c) RETURNING id INTO brokerage;
    INSERT INTO investments(create_time,update_time,name,type,symbol,amount,quote,value,account_id,household_id,household_currency_id,user_id)
    VALUES(now(),now(),'VFV.TO','stock','VFV.TO',0,150,0,brokerage,h,c,u);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM transactions WHERE household_id=h AND description='UI demo · Shared savings transfer') THEN
    SELECT id INTO STRICT transfer_category FROM transaction_categories WHERE name='Money Transfer' AND household_id=h LIMIT 1;
    SELECT id INTO STRICT source_account FROM accounts WHERE household_id=h AND name='TD Chequing Account';
    INSERT INTO transactions(create_time,update_time,datetime,description,household_id,category_id,user_id)
    VALUES(now(),now(),now(),'UI demo · Shared savings transfer',h,transfer_category,u) RETURNING id INTO transfer_id;
    INSERT INTO transaction_entries(create_time,update_time,amount,account_id,household_id,transaction_id)
    VALUES(now(),now(),-25,source_account,h,transfer_id),
      (now(),now(),25,(SELECT id FROM accounts WHERE household_id=h AND name='Demo · Alexandra emergency savings'),h,transfer_id);
  END IF;

  FOR n IN 1..6 LOOP
    IF NOT EXISTS(SELECT 1 FROM snapshots WHERE household_id=h AND note='UI demo history '||n) THEN
      INSERT INTO snapshots(create_time,update_time,note,household_id)
      VALUES(now()-(7*n||' days')::interval,now(),'UI demo history '||n,h) RETURNING id INTO snap;
      INSERT INTO snapshot_entries(create_time,update_time,liquidity,investment,property,receivable,liability,household_id,snapshot_id,user_id,household_currency_id)
      VALUES(now(),now(),52000-n*1100,39000-n*700,0,0,-6900+n*150,h,snap,u,c);
      INSERT INTO snapshot_rates(rate,snapshot_id,from_household_currency_id,to_household_currency_id,household_id,create_time,update_time)
      VALUES(0.72,snap,c,usd,h,now(),now()),(1.388888888888888889,snap,usd,c,h,now(),now());
    END IF;
  END LOOP;
END $$;
COMMIT;
