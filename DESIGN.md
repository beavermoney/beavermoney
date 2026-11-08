# Beaver Money design system

Use Astryx with its default neutral theme. Component typography, colors, spacing, shape, focus states, elevation, and motion come from the library without a custom brand skin.

## Implementation

- Import components directly from `@astryxdesign/core`. Consult `pnpm exec astryx component <Name>` before changing their APIs.
- `Theme` uses `neutralTheme` and supports light, dark, and system mode. CSS imports and layer order live in `web/src/styles.css`.
- Prefer component props and Astryx layout components. Build page structure with Layout, LayoutContent, Stack, Grid, Section, Card, List and FormLayout. Let components own their spacing and appearance; retain custom sizing only for financial chart geometry and accessibility utilities.
- Use Astryx dialogs, menus, selectors, calendars, radio lists, tabs, command palette, navigation, and toast infrastructure.
- Shared adapters exist only for domain behavior: exact currency input, date conversion, object selection, and TanStack Router links.
- Financial charts use Recharts and Nivo with Astryx semantic color tokens. Keep each account category's color consistent across charts and lists.
- Lucide supplies application icons. Icon-only controls require meaningful accessible labels.

## Product requirements

Preserve signed amounts, exact decimal handling, privacy masking, keyboard operation, mobile navigation, and confirmed writes. A visual refresh must not change financial calculations or mutation semantics.

## Verification

Run frontend tests, TypeScript, ESLint, the production build, and `pnpm exec astryx doctor --built .`. Review desktop and mobile layouts in both themes, including menus, selection, dialogs, and transaction entry.
