# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Beaver Money is a personal finance management application with a Go backend and React frontend. The stack uses:

- **Backend**: Go with GraphQL (gqlgen), Ent ORM, PostgreSQL
- **Frontend**: React 19, TanStack Router, Relay, Vite, Tailwind CSS v4

## Key Technologies

### Ent Framework

- ORM for Go that generates type-safe database code
- Schema definitions in `ent/schema/*.go`
- Generates code in `ent/` directory
- Run `just codegen` after schema changes

### GraphQL Architecture

- **Two GraphQL schemas**:
  - `ent.graphql`: Auto-generated from Ent schema
  - `beavermoney.graphql`: Custom types, queries, mutations, and extensions
- Schemas are merged into `relay.graphql` for frontend consumption
- Use `just dev` to merge schemas (watches for changes)

### gqlgen Configuration

- Field-level resolvers for selective computation
- Configure in `gqlgen.yml` with `resolver: true` on specific fields
- Resolvers implemented in `beavermoney.resolvers.go`
- Run `just codegen` to regenerate after GraphQL schema changes

### Relay (Frontend)

- Fragment colocation pattern - components declare their data requirements
- Connection pattern for pagination with `@connection` directive
- Fragments on specific types (e.g., `TransactionCategory`, `FinancialReport`)
- Use `just dev` to run relay-compiler (watches for changes)
- Generated files in `__generated__` directories

## Development Commands

### Environment Setup

```bash
# mise provides all development tools
mise install
```

### Database

```bash
just compose up # Start PostgreSQL
just compose down # Stop PostgreSQL
```

### Backend Development

```bash
just server # Run Go server
just codegen # Generate Ent + GraphQL code
```

### Frontend Development

```bash
just web # Run Vite dev server (port 5173)
just dev # Run GQL schema merge + Relay compiler in parallel
cd web && pnpm check  # Format and lint
```

### Database Migrations

```bash
just migrate <name>        # Create new migration
just migrate-hash          # Hash migrations for Atlas
```

## Architecture Patterns

### Date Range Handling

**Philosophy**: Client calculates all date ranges and sends UTC timestamps. Server is timezone-agnostic.

**Frontend** (`lib/date-range.ts`):

```typescript
import { getDateRangeForPreset, dateRangeToISO } from "@/lib/date-range";

// User selects "THIS_MONTH" preset in their local timezone
const dateRange = getDateRangeForPreset("THIS_MONTH");
// Returns: { startDate: Date, endDate: Date } in local time

// Convert to ISO UTC strings for GraphQL
const period = dateRangeToISO(dateRange);
// Returns: { startDate: "2024-01-01T05:00:00Z", endDate: "2024-01-15T20:00:00Z" }

// Query with UTC timestamps
query({ startDate: period.startDate, endDate: period.endDate });
```

**Backend** (`beavermoney.helpers.go`):

```go
func parseTimePeriod(period TimePeriodInput) (time.Time, time.Time) {
    // Just use the provided UTC dates directly
    if period.StartDate != nil && period.EndDate != nil {
        return *period.StartDate, *period.EndDate
    }
    return time.Time{}, time.Now()  // Default: all time
}
```

**Why this approach:**

- ✅ Server doesn't need timezone parsing or preset logic
- ✅ Client has full context (user's timezone, current time)
- ✅ Simpler GraphQL schema - no `TimePeriodPreset` enum
- ✅ Easier to test - server just filters by timestamps
- ✅ Better separation of concerns - UI logic stays in UI layer

**Important**: Always send ISO 8601 UTC timestamps from client to server. Never send timezone strings or let server calculate semantic periods like "this month".

### Backend: Multi-Currency Financial Aggregations

When implementing financial aggregations (income, expenses, etc.):

1. **Always group by currency first** in SQL queries

   ```go
   // Group by category AND currency
   s.Select(
       sql.As(cu.C(currency.FieldCode), "currency_code"),
       sql.As(sql.Sum(te.C(transactionentry.FieldAmount)), "total"),
   )
   s.GroupBy(categoryID, currencyCode)
   ```

2. **Convert to household currency in Go** using FX rates

   ```go
   for _, row := range results {
       rate, err := r.fxrateClient.GetRate(ctx, row.CurrencyCode, householdCurrency, time.Now())
       total = total.Add(row.Total.Mul(rate))
   }
   ```

3. **Use Ent constants** for table/column names - never hardcode strings

   ```go
   // Good
   te := sql.Table(transactionentry.Table)
   te.C(transactionentry.TransactionColumn)  // FK columns use XColumn
   te.C(transactionentry.FieldAmount)        // Regular fields use FieldX

   // Bad
   sql.Table("transaction_entries")
   te.C("transaction_id")
   ```

### Backend: GraphQL Field Resolvers

For types with expensive computed fields:

1. Mark fields with `resolver: true` in `gqlgen.yml`
2. Implement field-level resolvers that only compute when requested
3. Always add error logging: `r.logger.Error("message", "error", err)`

### Frontend: Fragment Colocation

Components declare their data requirements via fragments:

```typescript
const MyComponentFragment = graphql`
  fragment myComponentFragment on SomeType {
    field1
    field2
    ...childComponentFragment
  }
`;

// Parent spreads fragment in query
const ParentQuery = graphql`
  query ParentQuery {
    someType {
      ...myComponentFragment
    }
  }
`;
```

Multiple fragments per component:

- Use descriptive names like `categoryCardCategoryFragment` and `categoryCardFinancialReportFragment`
- Props should be named `categoryRef`, `financialReportRef` etc. for clarity
- Use `useMemo` for lookups to avoid recomputation

**Best Practice: Fragment References, Not Prop Drilling**

Components should ONLY accept fragment references - never prop drill computed data or context values:

```typescript
// ❌ BAD: Prop drilling data and context
interface BadProps {
  totalIncome: currency
  totalExpenses: currency
  net: currency
  savingRate: string
  currencyCode: string  // Context value being drilled
}

// ✅ GOOD: Fragment reference only
const FinancialSummaryCardsFragment = graphql`
  fragment financialSummaryCardsFragment on FinancialReport {
    totalIncome
    totalExpenses
  }
`

interface GoodProps {
  fragmentRef: financialSummaryCardsFragment$key
  // No currencyCode prop - use useHousehold() hook instead!
}

export function FinancialSummaryCards({ fragmentRef }: GoodProps) {
  // Get data from fragment
  const data = useFragment(FinancialSummaryCardsFragment, fragmentRef)

  // Get context via hooks, not props
  const { household } = useHousehold()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  // Compute derived values internally
  const { totalIncome, totalExpenses, net, savingRate } = useMemo(() => {
    const income = currency(data.totalIncome)
    const expenses = currency(data.totalExpenses)
    const netAmount = income.subtract(expenses)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      net: netAmount,
      savingRate: income.value === 0 ? ':(' :
        `${((netAmount.value / income.value) * 100).toFixed(2)}%`,
    }
  }, [data.totalIncome, data.totalExpenses])

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Use household.currency.code from hook */}
      {formatCurrencyWithPrivacyMode({
        value: totalIncome,
        currencyCode: household.currency.code,
      })}
    </div>
  )
}

// Parent usage - clean and simple
<FinancialSummaryCards fragmentRef={data.financialReport} />
```

**Why this pattern:**

- ✅ Component declares its own data requirements via fragments
- ✅ Uses React hooks for context (useHousehold, useCurrency) instead of prop drilling
- ✅ Computes all derived values internally - no prop drilling computed data
- ✅ Self-contained and easy to refactor
- ✅ Relay optimizes data fetching automatically
- ✅ Component API is clean - only fragment references as props

### Frontend: Component Patterns

Follow the accounts panel/card pattern for list views:

- Accordion triggers show type name + total (right-aligned, monospace)
- Cards show item name (left) + value/details (right, monospace)
- Use `<span className="grow"></span>` to push content right
- Multi-currency amounts computed server-side, formatted with privacy mode

## Code Style

### Backend (Go)

- Use Ent-generated constants for all database field/column references
- Foreign key columns: Use `XColumn` constant (e.g., `transactionentry.TransactionColumn`)
- Regular fields: Use `FieldX` constant (e.g., `transaction.FieldID`)
- Always use `r.logger` for error logging in resolvers

### Frontend (React/TypeScript)

- Functional programming: Use `.map()`, `.filter()`, `.find()`, `.flatMap()` - no for loops
- Fragment colocation: Components declare all data needs
- No prop drilling computed data - components fetch and compute their own data
- Use `currency.js` for money calculations
- Privacy mode support for all financial displays

## Important Files

- `ent/schema/*.go` - Database schema definitions
- `beavermoney.graphql` - Custom GraphQL schema
- `gqlgen.yml` - GraphQL code generation config
- `beavermoney.resolvers.go` - GraphQL resolver implementations
- `web/relay.config.json` - Relay compiler configuration
- `justfile` - Task runner commands
- `web/src/routes/` - File-based routing with TanStack Router

## Design Context

### Users

Beaver Money serves individuals, couples, and families managing personal finances. Users interact with the app to log transactions, track accounts and investments, monitor spending by category, and understand their financial health across a shared household. The app supports multi-user households where partners or family members contribute to a unified financial picture. Users range from financially casual (wanting a clear snapshot) to power users who track every dollar. The privacy mode suggests the app is used in contexts where others might see the screen.

### Brand Personality

**Clever, Playful, Professional.** Beaver Money is the smart friend who's surprisingly good with money. The beaver mascot holding a gold coin sets the tone: industrious and wealth-building, but never stuffy. The tagline "Log your transactions. Build your dam." captures it perfectly — financial discipline framed as something constructive and even fun, not punitive. The app takes your money seriously without taking itself too seriously.

### Aesthetic Direction

**Visual tone**: Information-dense but breathable. Compact text (`text-xs/relaxed`) and tight spacing keep data accessible without overwhelming. The warm golden primary color (OKLCH hue ~58) evokes wealth and trust, grounding the neutral gray UI with warmth. Dark mode is a first-class citizen with carefully calibrated OKLCH values for contrast.

**References**: Linear (keyboard-driven density, professional polish, fast interactions) and Copilot Money (clean financial data presentation, approachable charts). The goal is Linear's efficiency married to Copilot Money's warmth.

**Anti-references**: Old-school banking apps — no stale corporate blue, no heavy table borders, no serif fonts, no institutional coldness. Beaver Money should feel like a modern tool, not a bank portal.

**Theme**: Light and dark modes with system preference detection. White/near-black backgrounds. The golden primary adds personality without dominating. Charts use a purposeful palette with distinct hues per asset class (green for net worth, blue for liquidity, amber for investments, red-orange for liabilities).

### Design Principles

1. **Data density with clarity** — Show maximum useful information in minimum space. Use `tabular-nums` for financial alignment, compact Item/ItemGroup patterns for lists, and Accordion grouping to let users expand what matters. Never sacrifice readability for density.

2. **Warmth in utility** — Financial tools can feel cold. The golden primary, playful mascot, and conversational copy (":(" for zero savings rate) inject personality without undermining trust. Every interaction should feel like progress ("Build your dam"), not burden.

3. **Fragment-driven composition** — Components declare their own data needs via Relay fragments and fetch context via hooks (`useHousehold`, `useCurrency`). No prop drilling. This keeps components self-contained, easy to move, and lets Relay optimize data fetching automatically.

4. **Privacy as a feature** — Financial data is sensitive. Privacy mode masks values with `•••••••` across the entire UI. All financial displays must support this toggle. Design for the reality that users open this app around other people.

5. **Keyboard-first, touch-ready** — Following Linear's lead, support keyboard shortcuts (`G+T` for transactions, `G+A` for accounts) and command palette navigation. But also provide mobile FAB navigation and standalone PWA support. Both interaction modes are first-class.

## Resources

Essential tutorials for this stack:

- [Relay Tutorial](https://relay.dev/docs/tutorial/intro/)
- [Ent Getting Started](https://entgo.io/docs/getting-started/)
