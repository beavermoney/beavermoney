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

It exists because the dominant alternatives (Mint and its successors) treat finance as content: ads, insights you didn't ask for, gamified savings. Spreadsheet alternatives treat it as a chore. Beaver Money treats it as a craft. Small, deliberate inputs over time produce an accurate, trustworthy picture, the way a beaver's daily work produces a dam.

The win, three months in, is simple. You look at your net worth, your cash flow, and your category breakdown, and you feel *this is real, I understand it, no surprises*.

## Who it's for

1. **Hands-on finance enthusiasts** who log transactions intentionally rather than rely on bank-sync automation.
2. **Self-hosters and privacy-conscious users** who want their data on their own infrastructure, with no telemetry and no upsell.
3. **Multi-person households** who need a shared financial picture across partners, roommates, or families.

Multi-household and multi-currency support cut across all three. They are defining features, not optional extras.

## Principles

1. **Accuracy is the feature.** Numbers are true and traceable. Converted values say so. Privacy mode masks; it never lies.
2. **Manual logging is intentional.** Keyboard-first input, considered defaults, no autopilot.
3. **Builder, not bank.** Sharp corners, dense layouts, type discipline. The aesthetic of a thoughtful tool, not a service sold to you.
4. **Plural by default.** Multi-household and multi-currency are first-class, not premium add-ons.
5. **Open about being open.** Self-hostability and AGPL are part of the offer, not fine print.

The full strategic and visual stance lives in [`PRODUCT.md`](./PRODUCT.md) and [`DESIGN.md`](./DESIGN.md).

## Features

- **Transactions** with categories, multi-entry money movement (so a single transaction can debit one account and credit another), and date-range views.
- **Accounts** organized by type or custom category, with running balances and inline FX conversion.
- **Investments** for stocks and crypto, with EODHD or Yahoo Finance quote refresh, lot tracking, and per-account rollups.
- **Recurring subscriptions** with weekly, monthly, yearly, or custom intervals and next-payment forecasting.
- **Balance snapshots** with FX rates pinned at snapshot time, so historical net worth stays accurate as currencies move.
- **Multi-household** with per-household roles (admin, member) and a first-class household switcher.
- **Multi-currency** with display-currency selection, native-amount preserved alongside, and Frankfurter for FX rates.
- **Privacy mode** that masks values without breaking layouts or chart proportions.
- **Keyboard-first navigation** including a `cmdk` command menu reachable from anywhere.
- **Color-blind-aware charts** built on seven semantic roles: net worth, liquidity, investment, property, receivable, liability, asset.
- **WCAG 2.2 AA target** with `prefers-reduced-motion` honored throughout.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Go 1.26, Chi v5, gqlgen, Ent ORM |
| Database | PostgreSQL 17, Atlas migrations |
| Cache | Redis 8 |
| Auth | JWT plus Goth (Google OAuth) |
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

[mise](https://mise.jdx.dev/) handles Go, Node, pnpm, just, atlas, watchexec, air, and docker-compose. Install it once, then:

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

Open [http://localhost:5173](http://localhost:5173). In dev mode the server seeds a demo household so the app is usable immediately, and a dev login shortcut signs you in as `joey@beavermoney.app` without configuring OAuth.

For more detail, see [`docs/development.md`](./docs/development.md).

## Self-hosting

Beaver Money is built to be self-hosted. The backend is a single Go binary. The frontend is a static Vite build. You bring PostgreSQL, Redis, and (optionally) a Frankfurter instance for FX rates. Set the env vars from [`.env.example`](./.env.example), build, and run.

A first-class container deployment recipe is on the roadmap. For now, [`docker-compose.dev.yml`](./docker-compose.dev.yml) shows the service shape.

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

`just dev` watches the GraphQL files and runs the merge plus Relay compiler. After changing schemas, run `just codegen`. Generated files are checked in but never edited by hand.

## Status

Beaver Money is honest about where it is.

**Working today.** Transactions, accounts, investments (stocks and crypto), recurring subscriptions, snapshots, multi-household, multi-currency, privacy mode, Google OAuth, keyboard navigation, color-blind-aware charts.

**Not yet.** Refresh tokens, GraphQL subscriptions / WebSocket push, background job queue, scheduled tasks, feature flags, A/B tests, packaged self-host containers, complex chart screen-reader summaries.

**Open todos.** See the "NOTES" section of [`AGENTS.md`](./AGENTS.md).

## Contributing

Issues and pull requests are welcome.

Before opening a PR:

1. Run `cd web && pnpm check` (Prettier, ESLint, TypeScript).
2. Run `golangci-lint run` and `go build ./...` for backend changes.
3. Match the codebase conventions in [`AGENTS.md`](./AGENTS.md), [`web/AGENTS.md`](./web/AGENTS.md), and the design rules in [`DESIGN.md`](./DESIGN.md). Sharp corners, ghost rings, no em dashes in UX copy.
4. Keep changes scoped. A bug fix is not a refactor.

For larger changes (new entities, new GraphQL surface, new product surface), open an issue first so we can align on direction.

## License

[AGPL-3.0](./LICENSE).

If you self-host Beaver Money for your own household, you are free to do so. If you offer it as a network service to others, the AGPL requires that your modifications be made available under the same license. The choice is deliberate. Open source is part of why this exists.

## Acknowledgements

- [Ent](https://entgo.io) and [gqlgen](https://gqlgen.com) for a backend schema-and-resolver loop that holds up.
- [Relay](https://relay.dev) for declarative data colocation that scales past the easy cases.
- [TanStack Router](https://tanstack.com/router) for type-safe file-based routing.
- [shadcn/ui](https://ui.shadcn.com) for component primitives that get out of the way.
- [Frankfurter](https://www.frankfurter.app) for free, reliable FX rates.

---

<div align="center">
  <sub>Built deliberately, in the open.</sub>
</div>
