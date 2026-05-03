# BEAVER MONEY - PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-03
**Commit:** 5e32a5e
**Branch:** main

## OVERVIEW

Full-stack personal finance app. Go backend (Ent ORM + gqlgen GraphQL) serves a React 19 frontend (Vite + TanStack Router + Relay) via a single `/query` GraphQL endpoint. Multi-household, multi-currency.

## DESIGN CONTEXT

Register: **product**. Personality: **sharp, precise, transparent**. North Star: **The Ledger Workshop** (a craftsman's bench, manual logging as honored craft).

- [PRODUCT.md](file:///Users/itsjoeoui/src/github.com/beavermoney/beavermoney/PRODUCT.md): users, purpose, principles, anti-references, accessibility floor (WCAG 2.2 AA + reduced-motion + privacy-mode masking).
- [DESIGN.md](file:///Users/itsjoeoui/src/github.com/beavermoney/beavermoney/DESIGN.md): visual system. Brand hue 92° (Beaver Pelt Amber), `--radius: 0` everywhere, ring-1 borders (no shadows), Inter Variable single-family, 28px (`h-7`) compact targets, seven-color semantic account palette (net worth/liquidity/investment/property/receivable/liability/asset).
- [DESIGN.json](file:///Users/itsjoeoui/src/github.com/beavermoney/beavermoney/DESIGN.json): machine-readable sidecar with tonal ramps, motion tokens, and component HTML/CSS snippets for the live design panel.

Anti-references baked into both docs: auto-import / Plaid aggregators, gradient-led visuals, navy-and-gold legacy fintech, neon-on-black crypto, gamified Robinhood-style streaks, generic SaaS-cream landing pages. Manual entry is the feature, not the friction.

Use the `$impeccable` skill at [.agents/skills/impeccable/SKILL.md](file:///Users/itsjoeoui/src/github.com/beavermoney/beavermoney/.agents/skills/impeccable/SKILL.md) for any design work; it loads the context above before doing anything.

## STRUCTURE

```
beavermoney/
├── cmd/server/           # Go HTTP server entry point (Chi router, JWT auth, OAuth)
│   ├── auth/             # Goth OAuth (Google), JWT middleware, household context
│   ├── config/           # Env-based config loader
│   └── database/         # PostgreSQL connection + Ent migrations
├── ent/                  # Ent ORM (mostly generated)
│   ├── schema/           # MANUAL: 7 schema files defining 16 entity types + 1 mixin
│   └── rules/            # MANUAL: privacy rules (FilterMember/Admin/Owner/...)
├── gql/                  # GraphQL resolvers + schema (see gql/AGENTS.md)
├── internal/             # Go internal packages
│   ├── contextkeys/      # Request context keys (UserID, HouseholdID, DisplayCurrencyID, PrivacyBypass)
│   ├── currencies/       # Currency list + validation
│   ├── frankfurter/      # FX rates client (OpenAPI-generated)
│   ├── gqlutil/          # GraphQL helpers
│   ├── market/           # Stock/crypto quotes (EODHD + Yahoo fallback)
│   └── seed/             # Demo data seeding (dev only)
├── scripts/              # merge-graphql.js (combines gql/*.graphql → relay.graphql)
├── docs/                 # development.md, database-triggers.md
├── .github/workflows/    # CI: frontend tests/checks + server (golangci-lint, build)
├── web/                  # React frontend (see web/AGENTS.md)
├── relay.graphql         # Merged GraphQL schema (auto-generated, don't edit)
├── generate.go           # `go generate` entry: runs ent codegen + gqlgen
├── gqlgen.yml            # gqlgen config: schema sources, resolver layout, type bindings
├── justfile              # Task runner commands
└── docker-compose.dev.yml
```

## WHERE TO LOOK

| Task                       | Location                                             | Notes                                           |
| -------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| Add entity/field           | `ent/schema/*.go`                                    | Run `just codegen` after                        |
| Add GraphQL query/mutation | `gql/query.graphql` or `gql/mutation.graphql`        | Run `just codegen` then `just relay`            |
| Write resolver logic       | `gql/*_resolvers.go`                                 | See `gql/AGENTS.md`                             |
| Add frontend route         | `web/src/routes/`                                    | TanStack Router file-based routing              |
| Add frontend component     | Route: `-components/`, Shared: `web/src/components/` | See `web/AGENTS.md`                             |
| Add custom hook            | `web/src/hooks/`                                     | Context+Relay fragment pattern                  |
| Add utility                | `web/src/lib/`                                       | Direct imports, no barrel files (except relay/) |
| Modify auth flow           | `cmd/server/auth/` + `cmd/server/main.go`            | JWT + Goth OAuth                                |
| Database migration         | `just migrate <name>` then `just migrate-hash`       | Atlas-managed                                   |
| Environment vars           | `.env` (backend), `web/.env` (frontend)              | See `.env.example` files                        |

## ENTITIES (ent/schema/)

| Entity                | Key Fields                               | Relationships                                                          |
| --------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| User                  | email, name                              | Households (via UserHousehold junction), UserKeys (OAuth)              |
| Household             | name, locale, is_demo                    | Accounts, Transactions, Investments, Categories, Currencies, Snapshots |
| Account               | name, type, balance, category, icon      | Household, User, Currency, Investments                                 |
| Transaction           | description, datetime, category          | Household, Entries (money movements), InvestmentLots                   |
| Investment            | name, type, symbol, amount, quote, value | Account, Currency, Lots                                                |
| RecurringSubscription | name, interval, cost, active             | Household, User, Currency                                              |
| Snapshot              | note                                     | Entries (balance by type), Rates (FX at snapshot time)                 |

Privacy rules (`ent/rules/privacy.go`) enforce access control: `FilterByHousehold`, `FilterMemberHousehold`, `FilterAdminHousehold`, `FilterOwner`, `FilterMe`, `FilterMeOrCoMember`, `FilterAdminOfTargetHousehold`, `BlockDemoHouseholdMutation`, `AllowPrivacyBypass`. Beyond the 7 top-level entities above, `ent/schema/` also defines junction/value types: `UserKey`, `UserHousehold`, `HouseholdCurrency`, `HouseholdRate`, `TransactionCategory`, `TransactionEntry`, `InvestmentLot`, `SnapshotEntry`, `SnapshotRate`.

## CONVENTIONS

- **No semicolons** in TypeScript/JSX (Prettier enforced)
- **Single quotes** for strings
- **Trailing commas** everywhere
- **Unused vars** must be prefixed with `_`
- **Path alias**: `@/` maps to `web/src/`
- **Icons**: Lucide (`lucide-react`)
- **UI components**: shadcn/ui with `base-mira` style
- **Data fetching**: Relay only (no REST, no Apollo, no TanStack Query)
- **Routing**: TanStack Router only (not React Router)
- **Decimal fields**: PostgreSQL `numeric(36,18)` for money
- **GraphQL IDs**: `IntID` (Go int, not string)
- **Auth headers**: `Authorization: Bearer <jwt>`, `X-Household-ID`, `X-Display-Currency-ID`
- **Generated code**: Never edit files in `__generated__/`, `ent/*.go` (except `ent/schema/`), `gql/generated.go`, `gql/ent.graphql`, `relay.graphql`, `routeTree.gen.ts`

## ANTI-PATTERNS (THIS PROJECT)

- Do NOT edit generated files (Ent, gqlgen, Relay compiler output)
- Do NOT hardcode database connection strings (see `ent/migrate/main.go` TODO)
- Do NOT use React Server Components (RSC disabled: `rsc: false`)
- Do NOT use `as any` or `@ts-ignore` (strict TypeScript)
- Do NOT add barrel files (direct imports preferred, except `lib/relay/`)
- Do NOT use Apollo/SWR/fetch for data fetching (Relay only)

## CODEGEN PIPELINE

```
ent/schema/*.go
  → go generate . (ent codegen + entgql)
    → ent/*.go (ORM)
    → gql/ent.graphql (auto-generated schema)
      → scripts/merge-graphql.js
        → relay.graphql (merged schema)
          → relay-compiler
            → **/__generated__/*.graphql.ts (Relay artifacts)
```

After modifying schemas: `just codegen` → `just relay`
During development: `just dev` watches and auto-runs merge + relay-compiler.

## COMMANDS

```bash
# Setup
mise install                     # Install all tools (Go, Node, pnpm, etc.)
just install-web                 # Install frontend dependencies
just compose up                  # Start PostgreSQL + Redis + Frankfurter

# Development
just server                      # Go server with hot-reload (air), port 3000
just web                         # Vite dev server, port 5173
just dev                         # Watch: merge-graphql + relay-compiler

# Code generation
just codegen                     # Ent + gqlgen
just relay                       # Relay compiler (one-shot)

# Database
just migrate <name>              # Create new migration
just migrate-hash                # Hash migrations with Atlas

# Quality
cd web && pnpm check             # Prettier + ESLint + TSC
cd web && pnpm test              # Vitest
```

## TECH STACK

| Layer          | Technology                | Version   |
| -------------- | ------------------------- | --------- |
| Language (BE)  | Go                        | 1.26.2    |
| ORM            | Ent                       | 0.14.5    |
| GraphQL (BE)   | gqlgen                    | 0.17.86   |
| HTTP Router    | Chi v5                    | 5.2.4     |
| Auth           | JWT + Goth (Google OAuth) | —         |
| Database       | PostgreSQL 17             | —         |
| Cache          | Redis 8.2                 | —         |
| Language (FE)  | TypeScript                | 5.9.3     |
| Framework (FE) | React                     | 19.2.5    |
| Build          | Vite                      | 7.3.2     |
| Routing        | TanStack Router           | 1.168.24  |
| Data           | Relay                     | 20.1.1    |
| Styling        | Tailwind CSS              | 4.2.4     |
| UI Kit         | shadcn/ui                 | base-mira |
| Testing        | Vitest + Testing Library  | 3.2.4     |
| Tool Manager   | mise                      | —         |
| Task Runner    | just                      | —         |

## NOTES

- Server runs migrations + seeds demo data on startup in dev mode (`!cfg.IsProd`)
- `relay.graphql` is auto-merged from `gql/*.graphql` files via `scripts/merge-graphql.js` — never edit directly
- React Compiler (`babel-plugin-react-compiler`) is enabled — manual `memo()`/`useMemo()` rarely needed
- Frontend uses `ky` HTTP client (not `fetch`) inside `web/src/environment.ts` for the GraphQL transport. App code never calls `ky` or `fetch` directly — Relay only.
- Data invalidation: Relay `useSubscribeToInvalidationState` + `invalidateRecord()` on the household record (no GraphQL subscriptions, no WebSocket)
- Observability: Sentry (BE + FE) + OpenTelemetry tracing on the GraphQL handler (`gqlgen-opentelemetry` + Sentry OTel span processor). `SENTRY_DSN` / `VITE_SENTRY_DSN` env vars.
- Rate limiting: `httprate.LimitByIP(100, time.Minute)` on all routes (Chi middleware)
- Market data: EODHD provider when `EODHD_API_KEY` is set, otherwise Yahoo Finance fallback (see `internal/market`)
- Dev login shortcut: `/auth/local/callback` issues a JWT for `joey@beavermoney.app` when `!cfg.IsProd` (uses `PrivacyBypass` context)
- Tests: 3 Go test files in `gql/` (member mutations, aggregations, view-user resolvers) + `ent/rules/privacy_test.go`. Frontend: Vitest configured, minimal coverage today (`web/src/lib/date-range.test.ts`).
- CI (`.github/workflows/ci.yml`): frontend Vitest + Prettier + ESLint + TSC + Vite build, server `golangci-lint v2.11.4` + `go mod tidy` + `go build ./...`
- Not implemented (by design today): GraphQL subscriptions, WebSocket/SSE push, background job queue, cron jobs, feature flags, A/B tests
- `web/src/components/ui/icons-data.ts` is 17k lines of icon metadata — expected, not a bug
- 2 open TODOs: refresh tokens (`cmd/server/main.go:260`), hardcoded migration DSN (`ent/migrate/main.go:44`)
