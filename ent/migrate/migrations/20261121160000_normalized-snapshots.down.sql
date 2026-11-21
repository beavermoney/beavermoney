DO $$ BEGIN RAISE EXCEPTION 'This data migration is forward-only. Apply a corrective forward migration.'; END $$;
