# Multi-User Household — Production Data Audit & Migration Runbook

## Pre-Migration Audit (MUST run before deploying T9 to staging/prod)

### Step 1: Check for pre-existing duplicate UserHousehold memberships
Any duplicate (user_id, household_id) pair would conflict with the new unique index.
Run against each environment:

```sql
-- Should return 0 rows in production. If not, manual cleanup required before migration.
SELECT user_id, household_id, COUNT(*) c
FROM user_households
GROUP BY user_id, household_id
HAVING c > 1;
```

**Expected result**: 0 rows (no duplicates). If rows appear, each duplicate must be manually removed before applying the migration.

### Step 2: Check for multi-member households (informational)
This confirms whether multi-user support is already in use:

```sql
SELECT household_id, COUNT(*) member_count
FROM user_households
GROUP BY household_id
HAVING COUNT(*) > 1;
```

**Expected result in production**: may return 0 rows (single-user households). In dev/staging with seed data, multiple rows are expected.

### Step 3: Confirm user_households table exists
```sql
\d user_households
```

---

## Migration Application Procedure

1. Ensure audit queries above return 0 duplicates
2. Run in the project root:
   ```bash
   just migrate add_multi_user_household_indexes
   just migrate-hash
   ```
3. Deploy the server; it will auto-apply the migration on startup
4. Verify indexes were created:
   ```sql
   \d user_households
   -- Expect: unique index on (user_id, household_id)
   \d accounts
   -- Expect: index on (household_id, user_id)
   \d transactions
   -- Expect: index on (household_id, user_id, datetime) in addition to existing (datetime)
   \d investments
   -- Expect: index on (household_id, user_id)
   \d recurring_subscriptions
   -- Expect: index on (household_id, user_id)
   ```

---

## Rollback Procedure

If the migration must be reverted:

1. Drop the new indexes manually:
   ```sql
   -- Get index names from \d user_households / \d accounts etc., then:
   DROP INDEX IF EXISTS <new_userhousehold_unique_index_name>;
   DROP INDEX IF EXISTS <new_accounts_composite_index_name>;
   DROP INDEX IF EXISTS <new_transactions_composite_index_name>;
   DROP INDEX IF EXISTS <new_investments_composite_index_name>;
   DROP INDEX IF EXISTS <new_recurring_subscriptions_composite_index_name>;
   ```

2. Files to revert (apply git revert or restore from main branch):
   - `ent/schema/user.go` (T1 changes)
   - `ent/schema/account.go` (T2 changes)
   - `ent/schema/transaction.go`, `ent/schema/investment.go`, `ent/schema/recurringsubscription.go` (T3 changes)
   - `ent/migrate/migrations/<timestamp>_add_multi_user_household_indexes.sql` (the migration file itself)
   - All other T4-T30 changes

3. Re-run `just migrate-hash` after reverting schema files

---

## Files Modified in This PR (for rollback reference)
- T1: `ent/schema/user.go`
- T2: `ent/schema/account.go`
- T3: `ent/schema/transaction.go`, `ent/schema/investment.go`, `ent/schema/recurringsubscription.go`
- T4: `ent/rules/privacy.go`
- T5: `gql/mutation.graphql`
- T6: `gql/extend.graphql`
- T7: `web/src/constant.ts`, `web/src/hooks/view-scope-store.ts` (new)
- T9: `ent/migrate/migrations/<timestamp>_add_multi_user_household_indexes.sql` (new)
- T10: `web/src/hooks/use-household-view-scope.tsx` (new)
- T11: `web/src/routes/_user/household/$householdId/-components/view-scope-switcher.tsx` (new)
- T12: `web/src/routes/_user/household/$householdId/route.tsx`
- T13-T16: `gql/mutation.resolvers.go`, `gql/extend.resolvers.go`, `gql/helpers.go`
- T17: `web/src/routes/_user/household/$householdId/settings/-components/add-member-dialog.tsx` (new)
- T18: `web/src/routes/_user/household/$householdId/settings/-components/members-settings.tsx`
- T19: `web/src/routes/_user/household/route.tsx`
- T20: Multiple CTA files in `web/src/routes/_user/household/$householdId/`
- T21-T26: Multiple query files in `web/src/routes/_user/household/$householdId/`
- T27-T30: New Go test files
