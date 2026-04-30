-- drop index "userhousehold_user_id_household_id" from table: "user_households"
DROP INDEX "userhousehold_user_id_household_id";
-- create index "userhousehold_household_id_user_id" to table: "user_households"
CREATE UNIQUE INDEX "userhousehold_household_id_user_id" ON "user_households" ("household_id", "user_id");
