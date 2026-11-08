# Astryx interaction review data

`astryx-review.sql` adds representative UI data to the isolated local `astryx_review` database: active/inactive subscriptions, a second member, active/archived accounts, a second brokerage with matching holdings, historical snapshots, a two-entry transfer, and an empty household.

It refuses to run against any other database. It can be rerun without duplicating the fixtures. Names beginning with `Demo ·` or `UI demo ·` are illustrative; prices and historical balances are not market data.

From the repository root, after the local demo seed has run:

```sh
docker compose -p beavermoney -f docker-compose.dev.yml exec -T postgres \
  psql -U user -d astryx_review -v ON_ERROR_STOP=1 < scripts/fixtures/astryx-review.sql
```

Point the local development server at `astryx_review` using `DEV_POSTGRES_URL`. Do not use a production connection. These fixtures do not send invitations or contact market-data providers.
