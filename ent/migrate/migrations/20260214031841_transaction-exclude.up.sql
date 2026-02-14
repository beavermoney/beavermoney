-- modify "transactions" table
ALTER TABLE "transactions" ADD COLUMN "exclude_from_reports" boolean NOT NULL DEFAULT false;
