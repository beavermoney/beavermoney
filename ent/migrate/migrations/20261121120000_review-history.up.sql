ALTER TABLE investments ADD COLUMN confirmed_average_cost text NULL,
 ADD COLUMN average_cost_confirmed_at timestamptz NULL,
 ADD COLUMN holdings_changed_at timestamptz NULL;
ALTER TABLE snapshots ADD COLUMN review_data text NULL;
ALTER TABLE investments ADD CONSTRAINT confirmed_average_cost_nonnegative
 CHECK (confirmed_average_cost IS NULL OR confirmed_average_cost::numeric >= 0);

-- Keep invalidation independent of transaction dates, including backdated edits and deletes.
CREATE FUNCTION invalidate_investment_average() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP <> 'INSERT' THEN
  UPDATE investments SET holdings_changed_at = clock_timestamp() WHERE id = OLD.investment_id;
 END IF;
 IF TG_OP <> 'DELETE' THEN
  UPDATE investments SET holdings_changed_at = clock_timestamp() WHERE id = NEW.investment_id;
 END IF;
 RETURN NULL;
END;
$$;
CREATE TRIGGER investment_average_review AFTER INSERT OR UPDATE OR DELETE ON investment_lots
 FOR EACH ROW EXECUTE FUNCTION invalidate_investment_average();
CREATE FUNCTION invalidate_transaction_average() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.datetime IS DISTINCT FROM OLD.datetime OR NEW.pending IS DISTINCT FROM OLD.pending THEN
  UPDATE investments SET holdings_changed_at = clock_timestamp()
  WHERE id IN (SELECT investment_id FROM investment_lots WHERE transaction_id = NEW.id);
 END IF;
 RETURN NULL;
END;
$$;
CREATE TRIGGER transaction_average_review AFTER UPDATE ON transactions
 FOR EACH ROW EXECUTE FUNCTION invalidate_transaction_average();
