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

## CSS ownership

- `web/src/styles.css` contains only dependency imports and cascade order, shared financial color tokens, and document defaults. Do not add feature selectors there.
- Prefer component props and token-backed utilities for simple layout. Keep coordinated selectors and responsive layouts in CSS Modules beside their owning component or route.
- Shared components own their styles: the horizontal chip rail is shared by transaction entry, account holdings, and chart selectors; public header/footer styles are shared by home and login.
- Safe-area styles are opt-in layout classes, not document-wide padding. Portaled navigation owns its own safe-area treatment.
- Date-picker portal overrides are scoped through local content classes. Test IDs are for tests, not styling.
- `theme-provider.css` contains the intentional app-wide Astryx sheet-handle override. Other library-internal selectors and WebKit corrections remain scoped to their owner; preserve their documented reason and verify replacements visually before removing them.
- Keep existing cascade priority when relocating styles. Moving a rule into a cascade layer is a separate behavior change, not a file-organization change.

## Product requirements

Preserve signed amounts, exact decimal handling, privacy masking, keyboard operation, mobile navigation, and confirmed writes. A visual refresh must not change financial calculations or mutation semantics.

## Verification

Run frontend tests, TypeScript, ESLint, the production build, and `pnpm exec astryx doctor --built .`. Review desktop and mobile layouts in both themes, including menus, selection, dialogs, and transaction entry.

## Loading layout stability

Loading and loaded content must share the same layout owner, spacing, responsive
breakpoints and reserved regions. Keep known headings and controls in place;
replace only unknown content. Avoid approximate full-section rectangles or generic
page skeletons where the real structure is known. Empty, partial and paginated
states must respect the same geometry. Bound unknown list content to its scroll
region rather than guessing its eventual row count. Verify delayed responses on
desktop and mobile by comparing control and neighboring-content rectangles, not
only the container height or CLS score. See `docs/loading-layout-audit.md` for the
current audit and verification.

Keep existing data visible during range changes and pagination until replacement
data is ready. Prepare route and dialog queries before committing their content;
do not replace an already useful page or form with an approximate skeleton.
URL-driven layout must describe the page still on screen while navigation waits.
