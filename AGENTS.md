# BEAVER MONEY - PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-12
**Commit:** 7a74cf0
**Branch:** main

## OVERVIEW

Full-stack personal finance app. Go backend (Ent ORM + gqlgen GraphQL) serves a React 19 frontend (Vite + TanStack Router + Relay) via a single `/query` GraphQL endpoint. Multi-household, multi-currency.

## STRUCTURE

```
beavermoney/
├── cmd/server/           # Go HTTP server entry point (Chi router, JWT auth, OAuth)
│   ├── auth/             # Goth OAuth (Google), JWT middleware, household context
│   ├── config/           # Env-based config loader
│   └── database/         # PostgreSQL connection + Ent migrations
├── ent/                  # Ent ORM (mostly generated)
│   └── schema/           # MANUAL: entity definitions (7 entities + mixin)
├── gql/                  # GraphQL resolvers + schema (see gql/AGENTS.md)
├── internal/             # Go internal packages
│   ├── common/           # Shared types
│   ├── contextkeys/      # Request context keys
│   ├── currencies/       # Currency list + validation
│   ├── frankfurter/      # FX rates client (OpenAPI-generated)
│   ├── gqlutil/          # GraphQL helpers
│   ├── market/           # Stock/crypto quotes (EODHD + Yahoo fallback)
│   └── seed/             # Demo data seeding (dev only)
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

Privacy rules enforce access control: `FilterMemberHousehold`, `FilterAdminHousehold`, `FilterOwner`.

## CONVENTIONS

- **No semicolons** in TypeScript/JSX (Prettier enforced)
- **Single quotes** for strings
- **Trailing commas** everywhere
- **Unused vars** must be prefixed with `_`
- **Path alias**: `@/` maps to `web/src/`
- **Icons**: Hugeicons library (not Lucide)
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
| Routing        | TanStack Router           | 1.168.18  |
| Data           | Relay                     | 20.1.1    |
| Styling        | Tailwind CSS              | 4.2.2     |
| UI Kit         | shadcn/ui                 | base-mira |
| Testing        | Vitest + Testing Library  | 3.2.4     |
| Tool Manager   | mise                      | —         |
| Task Runner    | just                      | —         |

## NOTES

- Server auto-drops/recreates DB on startup in dev mode and seeds demo data
- `relay.graphql` is auto-merged from `gql/*.graphql` files - never edit directly
- React Compiler (babel-plugin-react-compiler) is enabled - manual `memo()`/`useMemo()` rarely needed
- Frontend uses `ky` HTTP client (not fetch) for GraphQL requests
- `web/src/components/ui/icons-data.ts` is 17k lines of icon metadata - expected, not a bug
- 3 open TODOs: refresh tokens (`cmd/server/main.go`), admin user mutations (`ent/schema/user.go`), hardcoded migration string (`ent/migrate/main.go`)
