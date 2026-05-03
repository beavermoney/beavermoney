<p align="center">
  <img src="web/public/assets/logo.png" alt="Beaver Money" width="140" height="140" />
</p>

<h1 align="center">Beaver Money</h1>

<p align="center">Log your transactions. Build your dam.</p>

<br />

A self-hostable personal finance app. You log each transaction yourself, and it tracks accounts, investments, recurring subscriptions, and balance snapshots across as many households and currencies as you need. Open source, AGPL-3.0.

The hand-logging is the point. A transaction takes a few seconds to enter, and the act of typing it in is what makes you aware of your spending. Do it for a few weeks and patterns surface on their own; the surprises in your statement stop being surprises. Auto-import would save you those few seconds and cost you the awareness, which is the whole reason to use the app.

## What it does

- **Multi-household.** Switch between personal, family, or shared finances. Per-household roles for members and admins.
- **Multi-currency.** Pick a display currency per household. FX conversion happens at the value, with the native amount kept visible. Rates from [Frankfurter](https://www.frankfurter.app/).
- **Transactions.** Double-entry money movements with category, datetime, description, and per-account entries.
- **Accounts.** Cash, bank, credit, investment, property, receivable, liability, and generic asset roles. Each with its own currency.
- **Investments.** Stocks and crypto with live quotes ([EODHD](https://eodhd.com/) when configured, Yahoo Finance fallback). Lots tie back to transactions for accurate cost basis.
- **Recurring subscriptions.** Track active subscriptions with renewal cadence and cost.
- **Snapshots.** Point-in-time balances with FX rates captured at that moment, so historical net worth stays accurate to the day it was taken.
- **Privacy mode.** Mask financial values for shared screens or screen recordings. Charts and totals stay coherent under the mask.
- **Keyboard-first.** Command menu (cmdk) for navigation. Real focus rings. Every action reachable without a mouse.

## Tech

| Layer    | Tools                                                                              |
| -------- | ---------------------------------------------------------------------------------- |
| Backend  | Go 1.26, Chi, [Ent](https://entgo.io/) (ORM), [gqlgen](https://gqlgen.com/) (GraphQL), JWT + Goth (Google OAuth) |
| Frontend | React 19, Vite, [TanStack Router](https://tanstack.com/router), [Relay](https://relay.dev/), Tailwind 4, shadcn/ui (`base-mira`) |
| Data     | PostgreSQL 17, Redis, Frankfurter (FX), EODHD or Yahoo (market quotes)             |
| Tooling  | [mise](https://mise.jdx.dev/) (toolchain), [just](https://github.com/casey/just) (commands), [Atlas](https://atlasgo.io/) (migrations), Air (hot reload) |

GraphQL is the only transport. No REST shims. Relay is the only client. Identity is a JWT bearer token plus `X-Household-ID` and `X-Display-Currency-ID` headers.

## Quick start

You will need [mise](https://mise.jdx.dev/) and Docker.

```bash
# 1. Install all toolchains (Go, Node, pnpm, Atlas, Air, just, watchexec)
mise install

# 2. Install web dependencies
just install-web

# 3. Copy env files
cp .env.example .env
cp web/.env.example web/.env

# 4. Generate secrets and paste them into .env
openssl rand -base64 32  # SESSION_SECRET
openssl rand -base64 32  # JWT_SECRET

# 5. Start Postgres, Redis, and Frankfurter
just compose up

# 6. Start the Go server (auto-runs migrations and seeds demo data in dev)
just server

# 7. In another terminal, start the Vite dev server
just web

# 8. In a third terminal, watch the GraphQL schema and rebuild Relay artifacts
just dev
```

Open http://localhost:5173. In development, `/auth/local/callback` issues a JWT for the seeded demo user, so you can poke around without configuring OAuth. For full Google OAuth, fill in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URL` in `.env`.

The GraphQL endpoint and playground both live at http://localhost:3000.

## Layout

```
beavermoney/
├── cmd/server/        # Go HTTP server (Chi, JWT, OAuth)
├── ent/schema/        # Database schema (Ent)
├── ent/rules/         # Privacy rules (multi-household access control)
├── gql/               # GraphQL schema and resolvers (gqlgen)
├── internal/          # Frankfurter client, market quotes, currencies, seed data
├── web/               # React frontend (Vite + Relay)
├── docs/              # Development guides
└── relay.graphql      # Merged schema (auto-generated, do not edit)
```

Deeper notes for contributors live in [`AGENTS.md`](./AGENTS.md), with module-specific docs in [`gql/AGENTS.md`](./gql/AGENTS.md) and [`web/AGENTS.md`](./web/AGENTS.md).

## Codegen

```
ent/schema/*.go
  → just codegen        # Ent + gqlgen
    → gql/ent.graphql
      → scripts/merge-graphql.js
        → relay.graphql
          → just relay  # Relay compiler
            → **/__generated__/*.graphql.ts
```

After changing any schema: run `just codegen && just relay` and commit the regenerated artifacts. During development, `just dev` watches and runs the merge plus Relay compiler automatically.

## Design

The product and visual stance live alongside the code:

- [`PRODUCT.md`](./PRODUCT.md): users, brand personality, anti-references, accessibility commitments.
- [`DESIGN.md`](./DESIGN.md): the visual system. Color tokens (oklch), typography (Inter Variable), spacing, components, do's and don'ts.
- [`DESIGN.json`](./DESIGN.json): the same system in machine-readable form.

In short: sharp corners, dense type, one warm amber accent, no shadows, no gradients, no SaaS chrome. WCAG 2.2 AA target. `prefers-reduced-motion` respected. Color-blind-safe chart palette.

## Contributing

Issues and pull requests welcome. Before opening a PR:

```bash
cd web && pnpm check    # Prettier, ESLint, TypeScript
cd web && pnpm test     # Vitest
golangci-lint run       # Go lint
go build ./...
go mod tidy
```

If you changed a schema, run `just codegen` and `just relay` and commit the regenerated artifacts.

The codebase is opinionated. Keep it that way:

- TypeScript with no `as any` and no `@ts-ignore`.
- Relay only on the frontend. No `fetch`, no Apollo, no TanStack Query.
- Tables for tabular data. Cards for summaries. Not the other way around.
- Tabular numerals on every money value.
- Don't add bank-sync, auto-categorization, or anything else that bypasses the user typing in a transaction.

The full conventions list is in [`AGENTS.md`](./AGENTS.md).

## License

[AGPL-3.0](./LICENSE). If you run a modified version as a network service, you must offer the source to your users.
