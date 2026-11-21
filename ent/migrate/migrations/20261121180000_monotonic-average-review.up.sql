-- A trade change must always sort after the last manual confirmation, even if
-- the application clock was ahead or the database clock moves backward.
-- Keep the watermark monotonic at PostgreSQL's microsecond precision.
CREATE OR REPLACE FUNCTION invalidate_investment_average() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP <> 'INSERT' THEN
  UPDATE investments
  SET holdings_changed_at = GREATEST(
   clock_timestamp(),
   holdings_changed_at + interval '1 microsecond',
   average_cost_confirmed_at + interval '1 microsecond'
  )
  WHERE id = OLD.investment_id;
 END IF;
 IF TG_OP <> 'DELETE' THEN
  UPDATE investments
  SET holdings_changed_at = GREATEST(
   clock_timestamp(),
   holdings_changed_at + interval '1 microsecond',
   average_cost_confirmed_at + interval '1 microsecond'
  )
  WHERE id = NEW.investment_id;
 END IF;
 RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION invalidate_transaction_average() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.datetime IS DISTINCT FROM OLD.datetime OR NEW.pending IS DISTINCT FROM OLD.pending THEN
  UPDATE investments
  SET holdings_changed_at = GREATEST(
   clock_timestamp(),
   holdings_changed_at + interval '1 microsecond',
   average_cost_confirmed_at + interval '1 microsecond'
  )
  WHERE id IN (SELECT investment_id FROM investment_lots WHERE transaction_id = NEW.id);
 END IF;
 RETURN NULL;
END;
$$;
