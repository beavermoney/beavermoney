-- modify "accounts" table
ALTER TABLE "accounts" ADD COLUMN "archived" boolean NOT NULL DEFAULT false;
