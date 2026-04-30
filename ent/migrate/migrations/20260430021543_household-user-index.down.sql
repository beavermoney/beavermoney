-- reverse: create index "userhousehold_household_id_user_id" to table: "user_households"
DROP INDEX "userhousehold_household_id_user_id";
-- reverse: drop index "userhousehold_user_id_household_id" from table: "user_households"
CREATE UNIQUE INDEX "userhousehold_user_id_household_id" ON "user_households" ("user_id", "household_id");
