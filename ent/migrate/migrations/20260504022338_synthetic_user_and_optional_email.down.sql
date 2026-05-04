-- reverse: modify "users" table
ALTER TABLE "users" DROP COLUMN "is_synthetic", ALTER COLUMN "email" SET NOT NULL;
