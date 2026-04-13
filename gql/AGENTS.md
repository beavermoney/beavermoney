# GQL - GRAPHQL RESOLVERS

gqlgen-powered GraphQL API layer. Schema-first, autobind to Ent models, follow-schema resolver layout.

## STRUCTURE

```
gql/
├── ent.graphql            # AUTO-GENERATED from Ent schemas (never edit)
├── ent.resolvers.go       # AUTO-GENERATED resolver stubs + MANUAL field resolvers
├── query.graphql          # MANUAL: custom query definitions
├── query.resolvers.go     # MANUAL: query resolver implementations
├── mutation.graphql       # MANUAL: custom mutation definitions + inputs
├── mutation.resolvers.go  # MANUAL: mutation resolver implementations (2k lines)
├── extend.graphql         # MANUAL: schema extensions (Household.financialReport)
├── extend.resolvers.go    # MANUAL: extension resolver implementations
├── generated.go           # AUTO-GENERATED gqlgen runtime (never edit)
├── helpers.go             # MANUAL: shared SQL builders for aggregations/FX
├── resolver.go            # Root Resolver struct (entgql.Transactioner)
└── model/
    └── models_gen.go      # AUTO-GENERATED Go types from schema
```

## WHAT TO EDIT vs WHAT IS GENERATED

| File                  | Editable? | Notes                             |
| --------------------- | --------- | --------------------------------- |
| `query.graphql`       | YES       | Add queries here                  |
| `mutation.graphql`    | YES       | Add mutations + input types here  |
| `extend.graphql`      | YES       | Extend auto-generated types here  |
| `*_resolvers.go`      | YES       | Implement resolver logic here     |
| `helpers.go`          | YES       | Shared SQL/aggregation helpers    |
| `resolver.go`         | YES       | Root struct, add dependencies     |
| `ent.graphql`         | **NO**    | Auto-generated from `ent/schema/` |
| `generated.go`        | **NO**    | gqlgen runtime                    |
| `model/models_gen.go` | **NO**    | gqlgen type generation            |

After editing `.graphql` files: run `just codegen` then `just relay`.

## RESOLVER PATTERNS

### Queries (query.resolvers.go)

```go
func (r *queryResolver) User(ctx context.Context) (*ent.User, error) {
    return r.client.User.Get(ctx, contextkeys.UserIDFromContext(ctx))
}
```

- Access user/household from context keys
- Return Ent models directly (autobind handles GraphQL mapping)

### Mutations (mutation.resolvers.go)

Each mutation follows this pattern:

1. Start OpenTelemetry span
2. Extract user/household from context
3. Validate input
4. Execute Ent operations (often within transaction via `entgql.Transactioner`)
5. Return result

**Transaction types**: CreateExpense, CreateIncome, CreateTransfer, BuyInvestment, SellInvestment, MoveInvestment, CreateSnapshot. Each is 50-100 lines.

**Custom inputs**: `mutation.graphql` defines wrapper types (e.g., `CreateExpenseInputCustom`) that compose Ent-generated inputs with additional fields.

### Field Resolvers (ent.resolvers.go)

Auto-generated stubs with manual implementations for computed fields:

- Aggregations (category totals, balance sums)
- Currency conversions via `helpers.go`
- Custom SQL queries for complex joins

### Extended Fields (extend.resolvers.go)

- `Household.financialReport` - Income/expense/net for date range
- `Household.netWorthOverTime` - Historical net worth from snapshots
- `FinancialReport.incomeBreakdown`, `expensesBreakdown`, `transactionCount`

## HELPERS (helpers.go)

Heavy SQL query builders for:

- Category-level aggregations with currency conversion
- Income/expense breakdowns by date range
- Transaction counting with filters
- FX rate application from snapshots

These use raw Ent predicates and SQL, not simple CRUD.

## KEY CONVENTIONS

- **IDs are integers**: `graphql.IntID` mapping in gqlgen.yml
- **Relay pagination**: All list fields use connections (first/last/after/before)
- **Privacy enforcement**: Ent privacy rules run automatically - resolvers don't manually check access
- **Context injection**: `contextkeys.UserIDFromContext(ctx)`, `contextkeys.HouseholdIDFromContext(ctx)`, `contextkeys.DisplayCurrencyIDFromContext(ctx)`
- **Tracing**: Mutations use `otel.Tracer` spans; Sentry captures errors
- **Atomic mutations**: `entgql.Transactioner` middleware wraps mutations in DB transactions

## COMPLEXITY HOTSPOTS

| File                    | Lines | Why                                   |
| ----------------------- | ----- | ------------------------------------- |
| `mutation.resolvers.go` | 2,012 | 30 mutations × 50-100 lines each      |
| `ent.resolvers.go`      | 1,074 | 194 field resolvers with custom SQL   |
| `helpers.go`            | 544   | Complex SQL builders for aggregations |

## WHERE TO LOOK

| Task                       | Location                                                                   |
| -------------------------- | -------------------------------------------------------------------------- |
| Add a query                | `query.graphql` (schema) + `query.resolvers.go` (logic)                    |
| Add a mutation             | `mutation.graphql` (schema + input type) + `mutation.resolvers.go` (logic) |
| Extend auto-generated type | `extend.graphql` + `extend.resolvers.go`                                   |
| Add computed field         | `ent.resolvers.go` (manual section)                                        |
| Add aggregation helper     | `helpers.go`                                                               |
| Change root resolver deps  | `resolver.go`                                                              |
| Understand type bindings   | `../gqlgen.yml` (autobind + models sections)                               |
