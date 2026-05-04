-- modify "users" table
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL, ADD COLUMN "is_synthetic" boolean NOT NULL DEFAULT false;
