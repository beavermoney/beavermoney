# Manual snapshot data model

The schema below is the final shape after all four forward migrations, including the November 21 simplification. Release verification is recorded in [manual-review-status.md](manual-review-status.md); live migration status is reported by the deployment.

## New tables

### `snapshot_accounts`

| Column | PostgreSQL type | Meaning |
|---|---|---|
| `id` | bigint, primary key | Observation identity |
| `household_id` | bigint, required FK | Owning household; household deletion cascades |
| `account_id` | bigint, required FK | Permanent account identity; individual account deletion is restricted by history |
| `create_time` | timestamptz, required | Capture time, explicitly copied from the snapshot |
| `balance` | numeric(36,18), required | Native-currency account balance; cash only for an investment account |
| `archived` | boolean, required | Archive state at capture time |

Unique index: `(household_id, account_id, create_time DESC)`. An archived observation must have zero balance. There is no `snapshot_id`, `revision`, `observed_at`, or `update_time`.

### `snapshot_investments`

| Column | PostgreSQL type | Meaning |
|---|---|---|
| `id` | bigint, primary key | Observation identity |
| `household_id` | bigint, required FK | Owning household; household deletion cascades |
| `investment_id` | bigint, required FK | Permanent holding identity, including its account |
| `create_time` | timestamptz, required | Capture time, explicitly copied from the snapshot |
| `quantity` | numeric(36,18), required | Shares/units at capture |
| `average_cost` | numeric(36,18), nullable | User-confirmed average cost **per share**, in the holding's currency |
| `market_price` | numeric(36,18), required | Stored market quote **per share** at capture |
| `average_confirmed_at` | timestamptz, nullable | When that manual average was confirmed |
| `needs_review` | boolean, required | Whether average cost was unconfirmed/stale at capture |
| `archived` | boolean, required | Archive state at capture |

Unique index: `(household_id, investment_id, create_time DESC)`. Average cost cannot be negative; an archived observation must have zero quantity. There is no `snapshot_id`, `revision`, `observed_at`, or `update_time`.

The archive/average CHECK constraints and observation foreign-key names are also declared in Ent metadata, so future generated migrations retain the database safeguards. Both new tables use Ent's `mixin.CreateTime`. Values are append-only, with database update guards as well as immutable Ent fields. The timestamp is deliberately assigned once for the entire capture; independent default insert timestamps would exclude some rows from an as-of lookup.

## Existing tables changed

### `snapshots`

Keeps `id`, `household_id`, `create_time`, `update_time`, and nullable `note`. Adds immutable `format_version`:

- `0`: existing category-only snapshot, read through `snapshot_entries`.
- `1`: normalized observations, resolved as of the snapshot's capture time.

The interim `review_data` text/JSON column is removed. A partial unique index on `(household_id, create_time) WHERE format_version = 1` guarantees one normalized capture per household timestamp. Capture creation is serialized per household and advances beyond the last saved timestamp when necessary. No revision tie-breaker is needed.

Only notes can be edited. A database trigger protects capture time, household and format. Deleting a journal entry removes its own FX and legacy category entries, but does not delete shared account/holding observations that later entries may still use. Those observations disappear only with explicit whole-household deletion.

### `snapshot_rates`

Final column shape remains the existing shape:

`id`, `household_id`, `snapshot_id`, `create_time`, `update_time`, `from_household_currency_id`, `to_household_currency_id`, `rate`.

`rate` is `numeric(36,18)`. Each new capture writes all distinct directed pairs of household currencies (N × (N−1)); same-currency conversion is identity and needs no row. Each new rate's `create_time` is the snapshot capture time. The proposed `as_of` column is removed in the simplifying forward migration. Source refresh age is not retained in snapshot history.

Rates belong to their snapshot and cascade on its deletion. Saved rates are protected from updates. Conversion uses that specific snapshot's rates even if all account/holding observations were reused.

Adding a display currency later may append previously missing FX pairs to older reviews, using historical rates requested for each review's date. This fills missing directions for all household currencies and can retry a partial provider response. Original saved pairs are never overwritten; new pair timestamps are explicitly set to that review's capture time. Financial observations and existing conversions remain frozen. The provider's source timestamp and the later backfill execution time are not stored in these rows.

Currency removal must retain all historical references. Any active or archived account/holding using the currency blocks removal, as do legacy category entries and saved FX rates. Consequently an otherwise-unused display currency already captured in a review remains retained. The ordinary currency-removal path must never delete snapshot rates to work around those foreign keys.

### `investments`

Adds:

| Column | Type | Meaning |
|---|---|---|
| `confirmed_average_cost` | numeric(36,18), nullable | Current manually entered average per share, nonnegative |
| `average_cost_confirmed_at` | timestamptz, nullable | Confirmation time |
| `holdings_changed_at` | timestamptz, nullable | Monotonic watermark of the last relevant trade-history mutation |
| `archived` | boolean, not null, default false | Retained but inactive empty holding |

`holdings_changed_at` remains stored because deleting a trade removes the row whose update time would otherwise be needed. Insert/update/delete triggers on investment lots and relevant transaction changes advance it using mutation time, including backdated trades. The watermark is the greatest of database wall-clock time, the previous watermark plus one microsecond, and the previous confirmation plus one microsecond. It therefore always invalidates an earlier confirmation even if application and database clocks differ or a clock moves backward. Confirmation itself sorts strictly after the expected watermark and is protected by the existing optimistic quantity/change-time check. They never compute or overwrite the manual average. Quote refreshes do not invalidate the average. The general investment `update_time` cannot substitute because quotes also update the investment.

Current holdings need review when an average/confirmation is missing or confirmation is not later than the last trade change. Closed positions have zero gain and no meaningful gain percentage. Snapshot observations freeze the warning at capture; a later confirmation cannot rewrite it.

Account, owner, currency, symbol, type and household identity are immutable. Archiving requires zero shares; restoring the parent account is required before restoring its holdings. Archived holdings are excluded from active search/trade choices and price refreshes.

### `accounts`

No new columns. Owner and category are immutable in both the application model and database; database identity protection also covers type, currency and household. Names/icons remain editable presentation metadata.

Archiving requires zero cash/value and no shares, and archives its empty holdings. The old individual `deleteAccount` API is deprecated and now archives; the UI offers archive only. Existing nonempty accounts that an older version allowed to archive because cash and holdings offset each other are restored by the forward migration rather than losing their value from history.

### `snapshot_entries`

No new columns. Retains existing category totals, owner and currency IDs for legacy snapshots. New captures do not write derived category totals. Saved entries are protected from updates. Legacy history supports only the detail it originally stored; account/holding-level history is not fabricated.

### `investment_lots` and `transactions`

No column changes. Added trade-change invalidation triggers described above. Buy/sell execution prices remain in lots because they determine consideration; share transfers no longer require a price. Existing quantity and valuation triggers remain. The removed moving-average calculator was Go application code, not a PostgreSQL average-price trigger.

`households`, `users`, `household_currencies`, and `household_rates` have no new database columns from this work. New Ent edges expose the observation relationships internally.

Household-member removal is blocked when the member or associated joint owner has any remaining owned account (including archived accounts), holding, subscription, transaction, or legacy snapshot entry. This retains the identity relationships needed to render history. This is a retained-record check, not a general authorship audit: old journal entries have no author field and deleted transactions do not retain a creator tombstone.

## Capture, deduplication and historical reads

1. Lock the household capture operation, load active accounts/holdings and newly archived entities, and validate the reviewed state against optimistic hashes.
2. Capture one timestamp and write a complete-household journal stamp, regardless of the UI's member filter.
3. Write an account observation only when balance or historical archive state changed.
4. Write a holding observation only when quantity, average, market price, confirmation time, review status or archive state changed.
5. Write the full FX matrix for this stamp in the same transaction.
6. Resolve each entity's latest observation where `create_time <= snapshot.create_time`.

Archived entities retain their historical observations. Their final archive transition is recorded once; repeatedly unchanged archived entities do not produce new rows. Historical reads must never filter using today's archive flag.

Chart reads batch the first requested point's baseline plus observations within the requested window. Request-local caching prevents per-point query fan-out and is never shared across users/households or requests.

The API exposes a typed `Snapshot.review` projection with accounts, holdings and rates. That projection includes calculated values and current names/icons for UI convenience; it is **not persisted as JSON**. Historical account/holding states expose their permanent entity references as `accountId` and `investmentId`, not as global `id` fields. This keeps Relay's historical state objects separate from live entities and from other snapshot states; shared global IDs would otherwise overwrite frozen values in the client cache.

## Derived values and time series

- Holding value = quantity × market price.
- Holding cost basis = quantity × manual average, when confirmed/current for that capture.
- Unrealized gain = holding value − cost basis; percentage = gain ÷ positive cost basis × 100.
- Investment-account value = cash + holding values converted using the capture's FX.
- Overall/category/owner totals and account/cash/individual-holding series are derived from those values and immutable account classification/ownership.
- Net-worth and category deltas compare two captures using each capture's own FX. Liability deltas follow the displayed debt sign, including overpayments; net worth retains signed liabilities.

Names, icons and owner display names are current presentation labels. The financial identity/classification they label cannot change. The model stores prices and FX at manual review times, not a continuous daily OHLC or exchange-rate feed. It does not preserve the market provider's quote timestamp or historical FX source-refresh timestamps.

## Migration and release checks

- `20261121120000`: manual-average fields and invalidation triggers; interim JSON prototype storage.
- `20261121160000`: normalized tables; converts/deduplicates any interim captures; preserves legacy entries/FX; identity and immutable-value guards; removes JSON.
- `20261121170000`: replaces observation `observed_at` with Ent `create_time`, removes revision and FX `as_of`, enforces unique normalized capture timestamps.
- `20261121180000`: makes trade-change watermarks monotonic and later than prior manual confirmations across application/database clock skew. Replaces trigger functions without adding columns or triggers.

All four new down migrations explicitly reject rollback; corrections require a new forward migration. Production remains untouched. A disposable PostgreSQL fixture reconstructs pre-release state and tests the full forward chain, including conversion of two identical prototype captures into one observation per entity. Resolver tests cover deduplication, frozen values/FX, notes-only edits, archive/restore, source-stamp deletion, stale confirmation, batched reads, household scope and database guards.
