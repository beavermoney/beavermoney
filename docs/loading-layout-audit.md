# Loading layout audit — 2026-11-22

Scope: application route loading, account/holding history, Journal, transaction
entry/edit overlays, average-cost editors, lazy category icons, and cold startup.
The findings below are resolved. Measurements describe the exercised cases, not
an assertion that every possible data set has been exhaustively tested.

## Account and investment history

`net-worth-chart-layout.tsx` owns the geometry for both initial loading and loaded
states: heading, series rail, 240px plot, date controls, statistics, and pagination.
Empty history, partial-history notices, and deselected series keep the same slots.

Range changes and older-history requests use **keep previous data**. Query inputs
are deferred independently of URL/history state, so the current plot and totals
remain visible until the replacement query resolves. A reserved spinner slot
indicates progress without replacing the chart with its initial skeleton.

## Resolved audit findings

| Surface                   | Resolution                                                                                                                                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic route skeletons   | Relay route loaders await their data before committing navigation. The current page remains mounted while a fixed progress indicator runs. Removed the approximate heading/three-block fallback. Unexpected suspension is contained inside the route viewport. |
| URL-driven layout changes | Shell spacing, route layouts, history state and scroll restoration follow the presented location during pending navigation, preventing the destination URL from changing the old page's layout early.                                                          |
| Journal                   | Initial data is prepared by the route loader. Loading older reviews keeps the existing rows until the next batch is ready.                                                                                                                                     |
| Transaction creation      | The form query resolves before the dialog/sheet portal mounts. The desktop action footer reserves its height.                                                                                                                                                  |
| Transaction editing       | Removed the guessed transaction preview. The complete editor mounts once its query is ready, including on mobile; the loaded form remains during closing. Reopening resets draft state.                                                                        |
| Average cost              | Pending, editable, unavailable and closed states share bounded metadata, input/action and feedback regions. Long metadata and feedback scroll inside their regions.                                                                                            |
| Category glyphs           | Fallback and loaded icons share a fixed token-sized inline box.                                                                                                                                                                                                |
| Fonts                     | Figtree is bundled locally with optional font display, avoiding a late network-dependent font swap.                                                                                                                                                            |
| Startup and redirects     | The fixed startup surface stays until the initial route and its data are ready. Household, settings and authentication redirects resolve before mounting page content.                                                                                         |

The route fix covers transactions, accounts/detail/edit, investments/detail/new,
categories/detail/new, merchants/unassigned/detail, subscriptions/detail, settings,
and household selection/layout. Fixed-position progress and lazy command/menu
surfaces remain outside document flow.

## Verification

- Delayed chart responses at 1440px, 390px and 320px, light/dark themes, populated
  and empty history, partial-review notices and deselected series: frame, heading,
  rail, plot, controls, totals, pagination and following section all matched
  exactly (0px difference). Frame heights: desktop 432px, mobile 464px.
- Production range switching at 1440px and 390px: identical old SVG path, totals
  and chart bounds throughout the delayed response; no skeleton; selected range
  and new data committed when ready.
- Delayed navigation across nine sidebar destinations at 1440px and 390px:
  existing headings and positions retained until commit; no horizontal overflow
  or browser errors. Cached destinations commit immediately.
- Production transaction create/edit at 1440px, 390px and 320px: no provisional
  dialog during the blocked query; complete form after resolution. Average-cost
  editor retained the exact 312px frame in pending and loaded states.
- Production Journal with intercepted populated history at 1440px and 390px:
  old row and heading bounds retained while loading more; new rows arrived after
  resolution, with no browser errors.
- Cold production startup at 1440px light/English, 390px dark/English and 320px
  light/Chinese: delayed fonts produced equal element bounds and zero observed
  late layout-shift entries. Initial household redirect retained startup through
  each blocked query until Transactions was ready.
- Frontend: 52 test files / 284 tests pass; TypeScript, ESLint, translation checks
  and production build pass. Astryx doctor: 12 pass, 1 styling warning, 0 failures.

Browser fixtures only intercept responses; verification does not create or change
financial records. Geometry comparisons accompany screenshots because CLS alone
can exclude shifts immediately following user input.
