# Loading layout audit — 2026-11-22

Scope: account history fix plus a source audit of application Suspense boundaries,
route pending components, skeletons, and lazy surfaces. This is not a claim that
all application loading transitions are now shift-free.

## Fixed: account and investment history

The accounts overview used a 200px rectangle for a chart with a heading, series
rail, 240px plot, date controls, summary and optional pagination. The placeholder
could never match the loaded component.

`net-worth-chart-layout.tsx` now owns the geometry for both states. Its heading
and series labels are shared; the plot, statistics and pagination have reserved
space. Date controls and statistics have deterministic desktop/mobile placement.
Empty history and deselected series occupy the same plot slot. Data notices stay
inside the plot budget, with scrolling for long notice content. The account list
below the chart does not move when chart data arrives.

The lightweight skeleton is available before the chart bundle loads. A boundary
inside `NetWorthChart` also contains data suspension on individual account and
holding pages. Loading older history uses the existing transition mechanism.
Financial calculation, filtering, history restoration and privacy masking are
unchanged.

## Remaining findings

| Priority                                       | Surface / source                                                                                       | Finding                                                                                                                                                                                              | Follow-up                                                                                                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High                                           | `components/route-content-boundary.tsx`, `pending-component.tsx`                                       | A 32px heading and three 64px blocks are reused for unrelated pages. Neither page-specific toolbars nor data-dependent list lengths match.                                                           | Share each route's loaded frame with its pending state. Keep the shell and known controls mounted; reserve the viewport for unknown list content. Preserve existing content during refresh. |
| High                                           | `journal/index.tsx` → `components/review-journal.tsx`                                                  | A single 200px skeleton becomes a heading, controls, review list and detail panel.                                                                                                                   | Extract Journal's stable frame and separate list/detail loading boundaries.                                                                                                                 |
| Medium                                         | `components/average-cost-prompt-surface.tsx`, `investments/$investmentId.tsx`                          | “Loading holding…” becomes a multi-field average-cost editor. Hug-height dialogs can resize and move actions.                                                                                        | Give each editor a shared loading/form layout; bound the dialog content and retain its action area.                                                                                         |
| Medium                                         | `components/transaction-composer/transaction-entry-surface.tsx`                                        | Desktop height (620px, viewport capped) and mobile tall-sheet frame are already reserved, but the generic pending blocks do not match the form inside. Footer actions also arrive after loading.     | Match entry-type field geometry and reserve the footer action height.                                                                                                                       |
| Medium                                         | `transactions/-components/transaction-dialog-preview.tsx`, `transactions-list.tsx`                     | Preview uses real transaction information when available, but its fallback assumes two entry rows. Transfers, investment fields, errors and long text can differ. Mobile edit sheet uses hug height. | Compare each transaction type under delayed queries; share row/form slots and stabilize sheet/action geometry.                                                                              |
| Low / needs measurement                        | `components/category-glyph.tsx`, `category-icon.tsx`                                                   | The caller supplies the fallback; stability depends on matching its resolved icon size. Current financial icon adapters generally provide a sized fallback.                                          | Keep identical icon boxes; exercise cold icon loads in dense lists.                                                                                                                         |
| Stable by construction for surrounding content | `components/page-progress.tsx`; lazy command menu, transaction entry and average-cost surface wrappers | Progress is fixed-position and adds no document-flow height.                                                                                                                                         | Preserve this behavior; inspect the overlay's internal geometry separately.                                                                                                                 |
| Separate startup transition                    | `index.html`, `main.tsx`, app boot                                                                     | Startup branding is replaced by the application shell. This is not the account-chart transition measured here. Font loading and full cold route loads need independent coverage.                     | Measure cold boot, CSS/font loading and shell hydration separately from data fallbacks.                                                                                                     |

The generic route finding applies to transactions, accounts and account detail/edit,
investments and holding detail/new, categories and detail/new, merchants and
unassigned/detail, subscriptions and detail, settings general/accounts/members,
and household selection/layout. These share the pending component; fixing just
one copy of its rectangle sizes cannot make all these routes exact.

## Verification

- Browser checks delay only the history response, capture loading and loaded
  screenshots, and compare bounding rectangles for the frame, heading, rail,
  plot, controls, statistics, pagination and following account section.
- Passed at 1440px, 390px and 320px widths in light/dark themes, with empty
  and populated history, partial-review notices, and deselected series. Every
  measured rectangle matched exactly (0px difference). Desktop frame height was
  432px; mobile frame height was 464px in both loading and loaded states.
- Populated/partial history in the browser verification uses intercepted response
  fixtures only; no financial records are created or modified.
- Regression tests cover suspension resolving to empty history, restored history
  controls/pagination, and privacy masking.

For follow-up fixes, verify actual geometry before and after a deliberately delayed
response. A matching overall height alone is insufficient if controls or adjacent
content still move. CLS alone is insufficient too: recent user-input shifts can be
excluded from that metric.
