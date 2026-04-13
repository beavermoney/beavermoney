# WEB FRONTEND - KNOWLEDGE BASE

React 19 + Vite + TanStack Router + Relay. Single-page app consuming Go GraphQL backend.

## STRUCTURE

```
web/src/
├── routes/                  # TanStack Router file-based routing
│   ├── __root.tsx           # Root layout (Relay env, theme, devtools)
│   ├── index.tsx            # Landing page (/)
│   ├── login.index.tsx      # Login page
│   ├── auth.callback.index.tsx  # OAuth callback handler
│   └── _user/household/     # Protected routes (auth guard)
│       ├── route.tsx        # Auth error boundary (catches 401)
│       ├── index.tsx        # Household selector/redirect
│       ├── new.tsx          # Create household
│       └── $householdId/    # Active household
│           ├── route.tsx    # Main layout (sidebar, header, providers)
│           ├── transactions/
│           ├── accounts/
│           ├── investments/
│           ├── categories/
│           ├── subscriptions/
│           └── settings/
├── components/              # Shared components (use Relay fragments)
│   ├── ui/                  # shadcn/ui base components (30+)
│   └── layouts/             # Layout primitives
├── hooks/                   # Custom hooks (Context + Relay pattern)
├── lib/                     # Utilities (direct imports, no barrels)
│   └── relay/               # Relay utilities (only barrel: index.ts)
├── env.ts                   # VITE_ env var validation
├── environment.ts           # Relay Environment (fetch + auth headers)
├── main.tsx                 # App entry (Sentry, Router, Theme, Relay)
└── styles.css               # Tailwind v4 entry
```

## ROUTING CONVENTIONS

### File Types

- `route.tsx` → Layout routes with `<Outlet />`. Search param validation, error boundaries.
- `index.tsx` → Leaf routes. Data loading (Relay queries), page content.
- `$param.tsx` → Dynamic segments. `Route.useParams()` for access.
- `new.tsx`, `edit.tsx` → CRUD pages.
- `-components/` → Route-scoped components (excluded from routing by `-` prefix).
- `__generated__/` → Relay compiler output (never edit).

### Route Hierarchy

```
__root.tsx
  └── _user/household/route.tsx (auth guard)
        └── $householdId/route.tsx (sidebar + providers)
              ├── transactions/route.tsx → index.tsx
              ├── accounts/route.tsx → index.tsx → $accountId.tsx
              ├── investments/route.tsx → index.tsx
              ├── categories/route.tsx → index.tsx
              ├── subscriptions/route.tsx → index.tsx
              └── settings/route.tsx → general.tsx, members.tsx
```

### Feature Module Pattern (EVERY feature follows this)

```
feature/
  ├── route.tsx              # Layout + search param validation (Zod)
  ├── index.tsx              # List page (loadQuery → usePreloadedQuery)
  ├── new.tsx                # Create page (optional)
  ├── $id.tsx                # Detail page (optional)
  └── -components/
      ├── feature-panel.tsx  # Main list component (useFragment)
      ├── feature-card.tsx   # Item display
      ├── new-feature.tsx    # Create form (useMutation)
      ├── edit-feature.tsx   # Edit form
      └── __generated__/     # Relay artifacts
```

### Search Params by Feature

- **transactions**: `start`, `end` (date range), `edit_transaction_id`, `log_type` (modal triggers)
- **accounts**: `accounts_group_by` (type | category)
- **investments**: `investments_group_by` (account | symbol)
- **subscriptions**: `sort_by` (cost_high | cost_low | next_payment | name_az | name_za)
- **categories**: `start`, `end` (date range)

## RELAY PATTERNS

### Data Loading (route → component)

```typescript
// In route index.tsx:
loader: () => loadQuery<myQuery>(environment, query, {}, { fetchPolicy: 'store-or-network' })

// In component:
const queryRef = Route.useLoaderData()
const data = usePreloadedQuery(query, queryRef)
return <Panel fragmentRef={data.household} />
```

### Fragment Colocation

Fragments defined in same file as consuming component. Never centralized.

```typescript
const fragment = graphql`
  fragment myFragment on Household {
    id
    name
  }
`
function MyComponent({ fragmentRef }: { fragmentRef: myFragment$key }) {
  const data = useFragment(fragment, fragmentRef)
}
```

### Mutations

```typescript
const result = await commitMutationResult<myMutation>(commitMutation, {
  variables: { input },
  updater: (store) => store.get(household.id)?.invalidateRecord(),
})
```

- Use `commitMutationResult` wrapper (lib/relay/) for async/await
- Most mutations invalidate household record (triggers refetch)
- Deletes use `@deleteEdge` + `useDeleteNode` hook with connection registry

### Connection Registry (lib/relay/)

Custom system for tracking Relay connections by node type:

- `useRegisterConnection(connectionId, NodeType)` → registers on mount
- `useDeleteNode(NodeType)` → returns function that gets all connections for deletion
- `NodeType` enum: Transaction, Account, Investment, RecurringSubscription, TransactionCategory

### Pagination

`usePaginationFragment` + `@refetchable` + `@connection` directives.
Infinite scroll via `react-intersection-observer`. Default page sizes: 20 (transactions), 50 (subscriptions).

### Invalidation

```typescript
useSubscribeToInvalidationState([params.householdId], () => {
  fetchQuery(environment, query, {}, { fetchPolicy: 'network-only' }).subscribe(
    {},
  )
})
```

## HOOKS (web/src/hooks/)

| Hook                 | Pattern                          | Purpose                                                 |
| -------------------- | -------------------------------- | ------------------------------------------------------- |
| `useUser`            | Context + Relay fragment         | Authenticated user (id, name, email)                    |
| `useHousehold`       | Context + Relay fragment         | Active household (id, name, locale, currencies)         |
| `useUserHousehold`   | Context + Relay fragment         | User role + household currency                          |
| `useDisplayCurrency` | Context + TanStack Store + Relay | Currency selection, conversion rates, `convert()`       |
| `usePrivacyMode`     | Context + localStorage           | Privacy toggle (masks financial values)                 |
| `useCurrency`        | Intl.NumberFormat + privacy      | `formatCurrency()`, `formatCurrencyWithPrivacyMode()`   |
| `useScreenSize`      | matchMedia                       | Type-safe breakpoint comparison (lessThan, greaterThan) |
| `useMobile`          | useScreenSize                    | `size < md` convenience boolean                         |

Provider hierarchy in `$householdId/route.tsx`: UserProvider → HouseholdProvider → UserHouseholdProvider → DisplayCurrencyProvider.

## COMPONENT ORGANIZATION

| Location                | Contains                                                  | Data-Aware?                       |
| ----------------------- | --------------------------------------------------------- | --------------------------------- |
| `components/ui/`        | shadcn/ui primitives (Button, Card, Dialog...)            | No                                |
| `components/`           | Shared business components (sidebar, nav, currency-input) | Yes (Relay fragments)             |
| `routes/*/-components/` | Route-scoped components (forms, panels, cards)            | Yes (Relay fragments + mutations) |

## UTILITIES (web/src/lib/)

| File            | Purpose                                                           |
| --------------- | ----------------------------------------------------------------- |
| `utils.ts`      | `cn()` - Tailwind class merging (clsx + twMerge)                  |
| `auth.ts`       | `logout()` - clears localStorage tokens                           |
| `currencies.ts` | 10 supported currencies, lookup, validation                       |
| `date-range.ts` | Date presets, subscription payment calculations, URL parsing      |
| `time.ts`       | Relative time ("2 hours ago"), date formatting                    |
| `logo.ts`       | Logo.dev API URLs (domain, ticker, crypto)                        |
| `relay/`        | Connection registry, mutation wrapper, node types (barrel export) |

## WHERE TO LOOK

| Task                             | Location                                              |
| -------------------------------- | ----------------------------------------------------- |
| Add new route                    | `src/routes/` following feature module pattern        |
| Add route-scoped component       | `src/routes/[feature]/-components/`                   |
| Add shared component             | `src/components/` (with Relay fragment if data-aware) |
| Add/modify shadcn component      | `src/components/ui/`                                  |
| Add custom hook                  | `src/hooks/` (Context + Relay fragment pattern)       |
| Add utility                      | `src/lib/` (direct import, no barrel)                 |
| Modify Relay environment         | `src/environment.ts`                                  |
| Modify search params             | Feature's `route.tsx` (Zod validation)                |
| Add Relay mutation               | In `-components/` file, use `commitMutationResult`    |
| Register connection for deletion | `useRegisterConnection` in list component             |

## ANTI-PATTERNS

- Do NOT use `fetch`/`axios`/`ky` directly for data - Relay only
- Do NOT create barrel files (except `lib/relay/index.ts`)
- Do NOT use Lucide icons - Hugeicons only
- Do NOT use `memo()`/`useMemo()` unnecessarily - React Compiler handles it
- Do NOT put shared components in `-components/` dirs
- Do NOT edit `routeTree.gen.ts` or `__generated__/` files
- Do NOT use React Router patterns - TanStack Router only

## NOTES

- `icons-data.ts` (17k lines) is expected - icon metadata registry
- Tests: Vitest + Testing Library, colocated (`*.test.ts`), minimal coverage currently
- `pnpm check` runs Prettier → ESLint → TSC (all must pass)
- React Compiler enabled via `babel-plugin-react-compiler`
- Modals triggered via search params (`edit_transaction_id`, `log_type`) in household layout
