<div align="center">
  <img src="web/public/favicon.svg" alt="Beaver Money" width="96" height="96" />

  <h1>Beaver Money</h1>

  <p><strong>Log your transactions. Build your dam.</strong></p>

  <p>An open-source, self-hostable personal finance app for people who want to own and understand their numbers.</p>

  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-737373?style=flat" alt="AGPL-3.0" /></a>
    <a href="https://go.dev"><img src="https://img.shields.io/badge/Go-1.26-00ADD8?style=flat&logo=go&logoColor=white" alt="Go 1.26" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript 5.9" /></a>
    <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/Postgres-17-4169E1?style=flat&logo=postgresql&logoColor=white" alt="Postgres 17" /></a>
    <a href="https://relay.dev"><img src="https://img.shields.io/badge/Data-Relay%2020-F26B00?style=flat" alt="Relay 20" /></a>
  </p>
</div>

---

## What it is

Beaver Money tracks transactions, accounts, investments (stocks and crypto), recurring subscriptions, and balance snapshots across multiple households and currencies. It is open source and built to be self-hosted.

Existing tools fall short. Mint and its successors treat finance as content: ads, unwanted insights, gamified savings. Spreadsheets treat it as a chore. Beaver Money treats it as a craft. Small, deliberate entries accumulate into an accurate picture you can trust, the way a beaver's daily work becomes a dam.

Three months in, the goal is simple. You open the app, look at your net worth, your cash flow, and your category breakdown, and you feel *this is real, I understand it, no surprises*.

## Who it's for

1. **Hands-on finance enthusiasts** who log transactions on purpose, instead of relying on bank-sync automation.
2. **Self-hosters and privacy-conscious users** who want their data on their own infrastructure, with no telemetry and no upsell.
3. **Multi-person households** who need a shared financial picture across partners, roommates, or families.

Multi-household and multi-currency matter to all three groups. They are defining features, not optional extras.

## Principles

1. **Accuracy is the feature.** Numbers are true and traceable. Converted values say so. Privacy mode masks; it never lies.
2. **Manual logging is intentional.** Keyboard-first input, considered defaults, no autopilot.
3. **Builder, not bank.** Sharp corners, dense layouts, type discipline. The aesthetic of a thoughtful tool, not a service sold to you.
4. **Plural by default.** Multi-household and multi-currency are first-class, not premium add-ons.
5. **Open about being open.** Self-hosting and the AGPL license are not fine print. They are part of why Beaver Money exists.

The full strategic and visual stance lives in [`PRODUCT.md`](./PRODUCT.md) and [`DESIGN.md`](./DESIGN.md).

## Features

- **Transactions** with categories, date-range views, and multi-entry support, so a single transaction can move money between accounts.
- **Accounts** organized by type or by your own categories, with running balances and inline FX conversion.
- **Investments** for stocks and crypto, with live quotes from EODHD or Yahoo Finance, lot tracking, and per-account rollups.
- **Recurring subscriptions** at weekly, monthly, yearly, or custom intervals, with next-payment forecasting.
- **Balance snapshots** that pin FX rates at the moment of capture, so historical net worth stays accurate as currencies move.
- **Multi-household** with per-household roles (admin, member) and a household switcher that is always one click away.
- **Multi-currency** with a display-currency picker, the original amount shown next to the converted one, and FX rates from Frankfurter.
- **Privacy mode** that masks values without breaking layouts or chart proportions.
- **Keyboard-first navigation**, including a `cmdk` command menu reachable from anywhere in the app.
- **Color-blind-aware charts** built on seven semantic roles: net worth, liquidity, investment, property, receivable, liability, asset.
- **WCAG 2.2 AA** as the accessibility target, with `prefers-reduced-motion` respected throughout.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Go 1.26, Chi v5, gqlgen, Ent ORM |
| Database | PostgreSQL 17, Atlas migrations |
| Cache | Redis 8 |
| Auth | JWT and Goth (Google OAuth) |
| Frontend | React 19, Vite 7, TypeScript 5.9 |
| Routing | TanStack Router |
| Data | Relay 20 (single GraphQL endpoint) |
| Styling | Tailwind CSS 4, shadcn/ui (`base-mira`) |
| Charts | Recharts, Nivo Sankey |
| FX rates | Frankfurter |
| Market data | EODHD or Yahoo Finance |
| Observability | Sentry, OpenTelemetry |

## Getting started

### Prerequisites

[mise](https://mise.jdx.dev/) pins every toolchain version this repo expects (Go, Node, pnpm, just, atlas, watchexec, air, docker-compose). Install mise once, then run:

```bash
mise install
```

### First-time setup

```bash
# 1. Install web dependencies
just install-web

# 2. Create env files
cp .env.example .env
cp web/.env.example web/.env

# 3. Generate secrets and paste them into .env
openssl rand -base64 32  # SESSION_SECRET
openssl rand -base64 32  # JWT_SECRET

# 4. Start Postgres, Redis, and Frankfurter
just compose up
```

### Run the app

In three terminals:

```bash
just server   # Go backend on :3000 (hot-reload via air)
just web      # Vite dev server on :5173
just dev      # GraphQL schema merge + Relay compiler watcher
```

Open [http://localhost:5173](http://localhost:5173). The dev server seeds a demo household on startup, so the app is usable right away. A dev-only login shortcut signs you in as `joey@beavermoney.app`, so you do not need to configure OAuth to try things out.

For more detail, see [`docs/development.md`](./docs/development.md).

## Self-hosting

Self-hosting is the intended path. The backend compiles to a single Go binary. The frontend builds to static files via Vite. You bring PostgreSQL, Redis, and (optionally) a Frankfurter instance for FX rates. Copy the env vars from [`.env.example`](./.env.example), build, and run.

Official container images are on the roadmap. Until then, [`docker-compose.dev.yml`](./docker-compose.dev.yml) shows which services are involved and how they connect.

## Project layout

```
beavermoney/
├── cmd/server/      Go HTTP entry: Chi, JWT, OAuth, migrations, seed
├── ent/             Ent ORM (schemas in ent/schema/, rest is generated)
├── gql/             GraphQL resolvers and schema (gqlgen)
├── internal/        Currencies, FX client, market quotes, seed data
├── web/             React 19 frontend (Vite + TanStack Router + Relay)
├── docs/            Development docs
├── PRODUCT.md       Strategic stance, audiences, principles
├── DESIGN.md        Visual system: tokens, components, do's and don'ts
├── relay.graphql    Merged GraphQL schema (auto-generated)
├── justfile         Task runner commands
└── docker-compose.dev.yml
```

Module-level knowledge lives in [`AGENTS.md`](./AGENTS.md) and [`web/AGENTS.md`](./web/AGENTS.md).

## How it works

Schema flows in one direction:

```
ent/schema/*.go
  → go generate (Ent + entgql)
    → ent/*.go and gql/ent.graphql
      → scripts/merge-graphql.js
        → relay.graphql
          → relay-compiler
            → __generated__/*.graphql.ts (Relay artifacts)
```

`just dev` watches the GraphQL files and runs the merge plus the Relay compiler. After any schema change, run `just codegen`. Generated files are committed to the repo, but never edited by hand.

## Status

Where the project stands today:

**Working.** Transactions, accounts, investments (stocks and crypto), recurring subscriptions, snapshots, multi-household, multi-currency, privacy mode, Google OAuth, keyboard navigation, color-blind-aware charts.

**Not yet.** Refresh tokens, GraphQL subscriptions and WebSocket push, background job queue, scheduled tasks, feature flags, A/B tests, packaged self-host containers, screen-reader summaries for complex charts.

**Open todos.** See the "NOTES" section of [`AGENTS.md`](./AGENTS.md).

## Contributing

Issues and pull requests are welcome.

Before opening a PR:

1. Run `cd web && pnpm check` (Prettier, ESLint, TypeScript).
2. Run `golangci-lint run` and `go build ./...` for backend changes.
3. Match the conventions in [`AGENTS.md`](./AGENTS.md), [`web/AGENTS.md`](./web/AGENTS.md), and [`DESIGN.md`](./DESIGN.md). Sharp corners, ghost rings, no em dashes in UX copy.
4. Keep changes scoped. A bug fix is not a refactor.

For larger changes (new entities, new GraphQL surface, new product surface), open an issue first so we can agree on direction.

## License

[AGPL-3.0](./LICENSE).

Run Beaver Money for your own household with no obligations. If you offer it as a network service to others, the AGPL requires that you publish your modifications under the same license. The license choice is deliberate. Open source is part of what Beaver Money is.

## Acknowledgements

- [Ent](https://entgo.io) and [gqlgen](https://gqlgen.com) for the schema-driven Go-to-GraphQL pipeline.
- [Relay](https://relay.dev) for declarative data fetching with fragment colocation.
- [TanStack Router](https://tanstack.com/router) for type-safe file-based routing.
- [shadcn/ui](https://ui.shadcn.com) for component primitives we can copy, own, and theme.
- [Frankfurter](https://www.frankfurter.app) for free, reliable FX rates.

---

<div align="center">
  <sub>Built deliberately, in the open.</sub>
</div>
