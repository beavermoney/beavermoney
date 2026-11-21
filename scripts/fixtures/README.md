# Astryx interaction review data

`astryx-review.sql` adds representative UI data to the isolated local `astryx_review` database: active/inactive subscriptions, a second member, active/archived accounts, a second brokerage with matching holdings, historical snapshots, a two-entry transfer, and an empty household.

It refuses to run against any other database. It can be rerun without duplicating the fixtures. Names beginning with `Demo ·` or `UI demo ·` are illustrative; prices and historical balances are not market data.

From the repository root, after the local demo seed has run:

```sh
docker compose -p beavermoney -f docker-compose.dev.yml exec -T postgres \
  psql -U user -d astryx_review -v ON_ERROR_STOP=1 < scripts/fixtures/astryx-review.sql
```

Point the local development server at `astryx_review` using `DEV_POSTGRES_URL`. Do not use a production connection. These fixtures do not send invitations or contact market-data providers.

## Manual snapshot forward compatibility

CI starts PostgreSQL 17 with an empty, disposable `beaver_review_compat_test`
database. The fixture is deterministic and offline: it never uses personal preview
data, market providers, or production connections.

From the repository root, with `REVIEW_TEST_DATABASE_URL` pointing to that empty
database:

```sh
go run ./scripts/fixtures/review-setup
psql "$REVIEW_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/fixtures/review-compatibility.sql
CI=true go test -race -count=1 ./...
```

The bootstrap requires the exact database name and refuses a nonempty database.
It creates the last-shipped schema, seeds two members, accounts, a holding,
transactions and legacy snapshot values/FX, then upgrades through the actual
server migration runner. It compares all legacy values, rates, timestamps and
notes before and after the upgrade.

`review-compatibility.sql` then reconstructs the old schema **only inside this
named disposable database**, inserts legacy and interim prototype captures, and
checks the complete forward migration chain. This test-only reconstruction is
not a deployment rollback. Two identical prototype captures prove the normalized
backfill reuses observations. It also checks that existing holdings do not receive
fabricated manual average-cost confirmations. Its migration paths resolve relative
to the SQL file; preserve the repository layout when invoking it inside a container.

The PostgreSQL resolver and database-guard tests run as part of `go test ./...`.
They require a `_compat_test` database. Most mutations roll back; the concurrent-commit test cleans up its own stamps and restores its changed state. In CI,
a missing `REVIEW_TEST_DATABASE_URL` fails instead of silently skipping these tests.
The CI workflow provisions and prepares this fixture before the race-enabled suite.

To run just the existing snapshot compatibility and database-guard cases:

```sh
go test ./gql -run 'TestReviewPostgresCompatibility|TestSnapshotPostgresDatabaseGuards' -count=1 -v
```

Coverage includes full-household captures, frozen prices/FX, legacy reading,
notes-only edits, stale-review rejection, retention after journal deletion,
archive/restore, immutable identities/values, batched as-of reads, and trade
triggers preserving manual averages while updating quantities and market values.
