# Merchant data model

Migration: `20261121190000_merchants.up.sql`. Forward only; no production migration has been performed as part of this local implementation.

## New table: merchants

| Column | PostgreSQL type | Meaning |
| --- | --- | --- |
| `id` | bigint identity, primary key | Global Ent ID, new range starts at 90194313216 |
| `create_time` | timestamptz, required | Creation time |
| `update_time` | timestamptz, required | Last metadata change |
| `household_id` | bigint, required FK | Immutable owning household |
| `name` | varchar(120), required | Display name, at most 120 Unicode codepoints after normalization |
| `name_key` | varchar(512), required | Unicode NFKC, collapsed whitespace and full Unicode case folding for matching |
| `icon` | varchar(253), nullable | Website domain for Logo.dev, matching Account.icon |

`(household_id, name_key)` is unique. The same normalized name can exist in different households. Creating an existing name returns that merchant. If a different icon is supplied too, the request asks to edit the existing merchant instead of silently discarding or replacing its icon. Renaming to another existing merchant is rejected and asks for a merge.

`icon` is a bare website hostname, trimmed and lowercased, with valid DNS labels and a maximum length of 253 characters. URLs, paths, ports, IP addresses and empty values are rejected. Use `clearIcon` to remove it. The frontend renders Logo.dev exactly as it does for account icons. No uploads, image bytes, file references, media routes or storage configuration are part of this feature.

The local prototype previously explored uploaded logos. Existing local `logo_key` columns/files are preserved untouched but unused; new installations contain only `icon`. No uploaded value is guessed into a domain. Production has not received this unreleased migration.

## Changed table: transactions

Adds nullable `merchant_id bigint`, referencing `merchants.id` with `ON DELETE RESTRICT`, plus `(household_id, merchant_id, datetime)` index for merchant feeds. There is no historical backfill or automatic classification: existing expenses stay unassigned until a user assigns them. Transaction amounts, entries, accounts, snapshot values and FX history are unchanged.

Merchant assignment is available only for expense transactions. Create-on-save and editing to a new merchant name happen inside the same GraphQL database transaction as the expense. A rejected expense leaves no empty merchant behind. Removing an assignment clears the FK without deleting the merchant. Changing a transaction's category away from expense clears its merchant. Explicitly assigning one to a nonexpense is rejected.

Database triggers enforce same-household merchant/category references and expense-only assignment, immutable merchant ownership, and prevent changing a referenced expense category's type/household. The category row is locked during assignment so maintenance edits cannot race the invariant. These guards supplement request privacy rules.

## Merge and concurrency

A merge locks the active household, verifies both merchants are accessible, reassigns **every** source transaction (including pending, excluded, outside the chosen period and belonging to other members), then permanently deletes the source in one transaction. The target's name and logo remain. No aliases, redirects or `merged_into` records are created. Failure rolls back both reassignment and deletion. Concurrent name creation and merchant assignment/merge use the same household lock; the unique name index and restricted FK provide additional protection.

## Insights

Amounts are computed from cash transaction entries using exact PostgreSQL numeric arithmetic and returned as decimal strings. Expense outflows appear as positive spending; positive entries/refunds reduce spending, including negative net spend if refunds exceed expenses. Split entries and fees sum once, while the count is the number of distinct expense transactions represented by the selected entries. Average means net spend divided by this count.

The period is start-inclusive/end-exclusive. Monthly groups use UTC calendar months. Lifetime extends through the current time. The household overview includes zero-spend merchants for management and an unassigned expense bucket. The frontend leaderboard can rank by net period spending or transaction count, using exact decimal comparisons for spending. Ties use the other metric, then the merchant name. The detail screen shows period spend, count, average, lifetime spend and transactions; category/month aggregation fields remain available in the API but are not requested by this UI. No client-side financial recomputation is required.

Member filters select **entry account owners**, matching FinancialReport, rather than transaction creators. Pending transactions are included; `exclude_from_reports` transactions are excluded. Currency conversion uses current household FX rates, also matching FinancialReport; historical journal snapshots remain independent. Identity conversion requires no stored self-rate. Missing/nonpositive foreign rates produce an explicit unavailable-rate error instead of silently omitting money.

The server-side autocomplete normalizes search text, caps results at 50 and ranks by most recent transaction use, then name. All read/write access remains household-scoped. No new snapshot/time-series tables or cached merchant totals are introduced.
