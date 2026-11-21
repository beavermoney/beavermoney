# Manual review and investment average cost

This document describes the implementation and its local release verification, not earlier prototypes. Live release status is tracked by the main-branch CI run and deployment; the checks below do not substitute for those results.

Preview: http://localhost:3833

## Snapshot and database contract

The complete table definitions, indexes, relationships, migration sequence and retained-data limitations are in [snapshot-data-model.md](snapshot-data-model.md).

- Every new review captures the whole household: active accounts, investment-account cash, each holding, newly archived identities and all distinct directed household FX pairs. Users do not select accounts or take independently timed account snapshots.
- A journal stamp is created for every review. `snapshot_accounts` and `snapshot_investments` store only changed financial observations. As-of reads reuse the latest observation at or before the stamp's `create_time`.
- Account history stores native-currency cash/balance. Holding history stores quantity, manual average per share, market price, confirmation time and historical review/archive flags. Totals, category values and unrealized gains are derived rather than duplicated in stored JSON or category aggregates.
- GraphQL review projections expose `accountId` and `investmentId` references instead of global `id` fields. Relay therefore stores each capture separately from live entities and other reviews; the UI converts those references only after reading the cache. A real-store regression verifies distinct historical values and unchanged live records without normalization warnings.
- There is no persisted snapshot `revision`, separate `observed_at`, FX `as_of`, or `review_data` JSON column. The API's `reviewRevision` is only an optimistic state hash used to detect changes between opening and saving a review.
- Snapshot values and capture metadata are immutable. Notes may be edited and journal entries deleted. Shared observations survive deletion of the entry that first recorded them, so later entries keep their values.
- Legacy category-only snapshots remain readable and chartable. Account/holding detail that was never captured is not fabricated.
- All new migration down files reject rollback. Data corrections use new forward migrations.

## Manual investment averages

- Each holding has a user-confirmed average cost per share. The former automatic moving-average calculation is removed.
- Buy/sell execution prices remain because they determine consideration. Share transfers do not ask for a price, including when edited or displayed.
- Trade changes invalidate average confirmation using a monotonic modification watermark, including backdated edits and deletions. Watermarks and confirmations remain correctly ordered under application/database clock skew. Several trades may be confirmed together afterward.
- The post-trade prompt can be deferred; the holding page and review attention list retain access to the editor. Optimistic quantity/change-time checks prevent saving an average against an outdated holding.
- Stale or missing averages produce unavailable unrealized gain/percentage and a warning saved with the review. Closed positions have zero gain and no meaningful percentage.
- Snapshot history records manual-review-time quotes and FX, not a continuous daily market-price or FX feed.

## Journal and review surfaces

- Journal is a separate sidebar destination. Snapshot creation is available only from its “Review & snapshot” action.
- Review creation uses an Astryx right-side drawer on desktop and a rounded bottom sheet on phones. Header and Cancel/Save controls remain visible while the content scrolls.
- The review shows net worth, the five category totals and deltas since the previous snapshot, followed by attention items and an optional journal note. The redundant account-by-account list is removed.
- The feed shows date/time, net worth, change since the previous review, the note and saved warnings. Reading an entry shows category summaries, not a full account/holding breakdown. Detailed observations remain available to scoped charts.
- Current review capture always covers the whole household even when a member filter is active elsewhere. Historical currency conversion uses saved rates and never invents a 1:1 rate for missing FX. Adding a display currency can fill missing historical pairs without replacing original saved rates.
- Privacy masking, English/Simplified Chinese labels, note editing, deletion confirmation and journal pagination are preserved.
- The proposed allocation graphic was cancelled and is not included.

## Account, investment and navigation design

- The Accounts chart retains its prior design. Individual account and holding pages reuse it with scoped series. Duration controls are left aligned, change statistics right aligned, and tooltip labels/values align in separate columns.
- Chart filter rails reuse the transaction composer's native horizontal scrolling, fading edge and chevron hint. The account-group padding seam is removed.
- Investment-account cards use three rows. Their final row has compact icon-and-symbol shortcuts for the largest holdings, expandable remaining shortcuts, and the cash amount/percentage on the right. Each shortcut opens that holding directly.
- Account icons remain paired with owner avatars: bottom-right on large icons, overlapping alongside small icons with space reserved before the name. Mobile transfers use large account icons without clipping.
- Desktop transaction entry has Save and Save again; mobile and desktop retain a secondary Reset action. Daily summary loading and loaded values reserve consistent height. Chart date-range loading reserves a spinner slot after the range buttons.
- Buy account selections show native-currency cash in parentheses; sell investment selections show available shares in parentheses. Both mobile and desktop retain compact, single-line labels and privacy masking. Sell picker choices also show available shares.
- The post-trade dialog uses Astryx's title/subtitle structure and asks for the updated average cost per share; quantity is labelled “Current shares.”
- Subscriptions has a separate Tools navigation section.
- The Astryx command palette searches accounts, holdings, symbols and owner names. Results include the account/owner icons and, for holdings, the investment icon. Sidebar Search and Cmd/Ctrl+K open it; keyboard selection navigates directly.

## Back navigation and restoration

- Account, investment, category and subscription detail Back buttons return to their real origin. Directly opened details fall back to their corresponding list without a navigation loop.
- Error-page Back actions and the legacy full-page transaction composer use the same history-aware behavior. Local picker Back controls and explicit destination actions keep their own semantics.
- Scroll restoration follows delayed/Suspense content and infinite-list growth. Existing Relay pages are reused; additional pages load when required to reach a stored offset. New user input or navigation cancels a pending restoration.
- Group folds, expanded holding shortcuts, chart duration/series and loaded page counts restore per history entry before layout. Opening or closing the command palette preserves that page identity and its scroll cache. Presentation state is session-scoped and bounded; financial data remains in Relay. The account search field is removed.

## Retention rules

- Accounts and holdings archive instead of being individually deleted. Archiving requires empty balances/shares. Account owner/category and holding financial identity remain immutable.
- A currency used by any active or archived account/holding cannot be removed. Saved FX and legacy snapshot references also retain a currency so historical values cannot be erased by deleting it from settings.
- Member removal is blocked by remaining owned records or history, including archived accounts, holdings, subscriptions, transactions and legacy snapshot entries belonging to that member or their joint owner.
- This is not a general authorship audit: previously deleted transactions have no creator tombstone, and old journal entries have no author field. Historical rows with an unavailable owner must retain financial values without crashing or bypassing user privacy.

## Release verification

The following broad release counts cover the snapshot/navigation work before the merchant extension. Final combined merchant checks are recorded below.

Completed review evidence includes:

- PostgreSQL forward-migration compatibility, frozen legacy values/FX/metadata, observation deduplication, archive/restore, source-entry deletion, immutable-value guards and manual-average invalidation.
- The real server migration runner against a disposable old-schema fixture containing legacy snapshots. No preview data or external quote/rate APIs are needed for CI setup.
- Concurrent capture probing: four simultaneous saves produced distinct timestamps and one unchanged observation per entity.
- Generated Ent schema inspection, exact merged GraphQL-schema comparison and Atlas migration checksum validation.
- Prior browser review at narrow phone and desktop widths in light/dark appearance, including privacy, long names, review surfaces, command-palette navigation, Back behavior, infinite-list scroll restoration and retained folded groups.

Latest frontend release checks (2026-11-21):

- **249 tests across 44 files passed**, including real-router palette open/close and result/Back restoration, chart state restoration, privacy masking, missing-FX handling, category delta arithmetic and selected trade availability across desktop/mobile, currencies and fractional/zero quantities.
- TypeScript, Prettier, production build and diff-whitespace checks passed. ESLint reported no errors and 91 warnings (including projection fields consumed by the shared review parser). Astryx doctor reported 11 passes, no warnings and no failures.
- Mobile chart tooltips were verified at 320px and 390px: long labels wrap, amounts remain readable and no horizontal page overflow occurs. Desktop drawer and mobile sheet were also checked in dark appearance; the preview's appearance was restored to System.
- Local logs: `/tmp/ui-release-tests-final.log`, `/tmp/ui-release-tsc-final.log`, `/tmp/ui-release-format-final.log`, `/tmp/ui-release-eslint-final.log`, `/tmp/ui-release-build-final.log`, `/tmp/ui-release-astryx.log`. Mobile tooltip proof: `/tmp/beaver-preview/release-tooltip-mobile.jpg`.

Final backend and browser verification (2026-11-21):

- Recreated an empty PostgreSQL 17 compatibility database and ran the real server migration bootstrap through all four forward migrations, including `20261121180000`. Legacy snapshot values, rates, timestamps and notes remained identical.
- Ran the compatibility SQL with its real relative migration includes, then the complete `CI=true go test -race -count=1 ./...` suite against that database; all passed. This includes concurrent saves/trade edits, atomic failure rollback, deletion and future-clock invalidation, currency/member retention and legacy history.
- Full Go lint reported **0 issues**; the Go build, module consistency and diff checks passed. Generated GraphQL/Relay contracts and the Atlas checksum were verified independently.
- After a full browser reload, search open/close and search-result → investment → Back retained the Accounts scroll position, collapsed Liquidity group and selected 3M range. Journal and holding history loaded without new console errors or Relay normalization warnings. Desktop review remained correctly laid out; the preview was left on the review drawer with temporary viewport overrides removed.
- Final logs: `/tmp/review-ci-bootstrap-final.log`, `/tmp/review-ci-fixture-final.log`, `/tmp/release-go-tests-final.log`, `/tmp/release-go-lint-final.log`, `/tmp/release-go-build.log`. Browser evidence: `/tmp/beaver-preview/release-restoration-desktop.jpg` and `/tmp/beaver-preview/release-review-desktop.jpg`.

Schema, backend and UI release reviews for the snapshot/navigation work have no remaining blocking findings. CI is configured to start PostgreSQL, prepare the deterministic compatibility fixture and run the database-backed tests with the Go suite. Mobile layout checks used browser viewport emulation, not a physical phone.

Go tooling: `env -u GOROOT GOTOOLCHAIN=go1.26.8` for generation and checks. The local app uses the isolated `beaver_review_preview` database; labeled sample journal entries are preview-only data.

## Merchant extension

The later merchant work adds nullable expense assignment, normalized household-local names, merchant management/merge and period/lifetime spending insights. Migration `20261121190000_merchants` adds `merchants` and nullable `transactions.merchant_id`, with a household/name uniqueness index, an expense/household guard and a restricting foreign key. Account and holding archive rules are unchanged.

Merchant logos use a nullable `merchants.icon` website domain and Logo.dev, matching account icons. The editor supports setting or clearing the domain; uploads and image storage are deferred. This adds no media routes or storage configuration. See [merchant-data-model.md](merchant-data-model.md) for the database and validation contract.

Initial combined merchant verification (2026-11-21, local only; before the later Logo.dev-only simplification):

- **276 frontend tests across 50 files passed**. The final routing test fixture correction was followed by both real-router tests and full TypeScript passing. Coverage includes staged/new/existing merchant selection, failed search, Save again/reset, expense editing, merge confirmed writes, logo crop/transport, privacy percentages and navigation with date filters.
- Full `go test ./...` passed. The complete gql race suite and focused real PostgreSQL merchant tests passed, including exact FX/refunds/member slices, opposite concurrent merges, duplicate creation, failed-write rollback and household/category guards. Backend lint reports zero issues.
- Fresh migration bootstrap preserved legacy snapshots and transactions and left existing expenses unassigned. The isolated preview database was aligned to the final unreleased1900 schema using forward DDL only, without changing financial data.
- TypeScript, English/Chinese catalog validation, production build and whitespace checks passed. ESLint has zero errors and99 warnings across the application. Astryx built-output doctor has12 passes, one grouped source-style warning and zero failures; its warnings include existing raw elements/token utility classes and test markup.
- Browser review covered390px mobile and1440px desktop dark layouts, half-width amount/merchant entry, autocomplete/new-name staging, reset, native logo crop controls, existing unassigned expense totals, filtered drill-down and Back navigation. A shared Astryx link adapter bug that duplicated query strings was fixed and verified in browser and real-router tests. No financial records were added or changed during visual review. Viewport overrides were removed.
- Evidence: `/tmp/merchant-final-tests.log`, `/tmp/merchant-routing-tests.log`, `/tmp/merchant-routing-tsc.log`, `/tmp/merchant-go-final.log`, `/tmp/merchant-gql-race.log`, `/tmp/merchant-pg-tests.log`, `/tmp/merchant-migration-check.log`, `/tmp/merchant-final-lint.log`, `/tmp/merchant-build-final.log`, `/tmp/merchant-eslint.log`, `/tmp/merchant-astryx-doctor.log`.

Implementation is ready for local user review. Nothing from the merchant extension has been pushed or deployed. The current Logo.dev-only implementation requires no upload or persistent-media configuration.


### Logo.dev and compact merchant display follow-up

User deferred uploaded logos. Merchants now use nullable `icon` domains, with Logo.dev rendering shared with accounts. Upload UI, transport, server routes/package and storage configuration were removed. Fresh migration1900 creates only the domain field; old local prototype file references/assets are retained untouched but unused.

Merchant amount/name tiles share typography and spacing; overflowing names reuse `ScrollingName`, including its reduced-motion fallback. Transaction cards and table rows use the merchant avatar with a small bottom-right category badge and place the merchant name beside the category name. Unassigned transactions retain their category icon.

After these changes, **269 frontend tests across48 files passed**, TypeScript and production build passed, and scoped ESLint reported no errors. Backend domain lifecycle/race tests, lint and fresh migration compatibility passed. Browser checks confirmed overflow scrolling and the compact row at390px, plus the domain-only edit form. No preview financial values were changed.

Latest frontend evidence: `/tmp/frontend-merchant-domain-final-tests.log`, `/tmp/frontend-merchant-domain-lint.log`, `/tmp/merchant-domain-tsc-final.log`, `/tmp/merchant-domain-build.log`.

### Merchant leaderboard and icon refinement

The merchant index now shows only the selected period's leaderboard, with Spend/Count ranking and a separate unassigned row when needed. Rows use Astryx's spacious padded list treatment without dividers against the hover surface. Merchant details show period spend, transaction count, average and lifetime spend, followed directly by transactions. English and Chinese catalogs are complete.

The complete frontend suite passed **267 tests across 47 files** after removing obsolete percentage-helper tests. TypeScript and the production build passed. Scoped lint has no errors (Relay projection warnings remain); Astryx doctor has no failures. Mobile (390px) and desktop (1440px) browser review verified ranking toggle, detail navigation/Back, and the simplified layouts.

Transaction merchant and investment avatars now share the larger 36px size in a consistent icon column. Investment list/detail cards display owner avatars at the bottom right, matching accounts; the separate owner-name line is removed. These final presentational changes passed TypeScript, production build and scoped lint, and were inspected at both viewport sizes. No schema changes accompany these refinements.

Evidence: `/tmp/merchant-leaderboard-final-tests.log`, `/tmp/merchant-leaderboard-build.log`, `/tmp/merchant-leaderboard-lint.log`, `/tmp/merchant-leaderboard-doctor.log`, `/tmp/merchant-final-size-build.log`, `/tmp/merchant-final-icon-lint.log`. Merchant changes remain local and unpushed.

### Merchant release verification

Final release checks passed: 267 frontend tests across 47 files; TypeScript; full frontend formatting; production build; full Go race-test suite against the isolated compatibility database; Go build and module tidy; zero backend lint issues; migration checksums using the repository's golang-migrate format; and diff whitespace checks. Frontend ESLint reports 96 warnings and no errors. The two test-file formatting findings were corrected before release. The first local database run targeted an older fixture without merchants; rerunning against the migrated release fixture passed.

Evidence: `/tmp/merchant-ship-tests.log`, `/tmp/merchant-ship-format.log`, `/tmp/merchant-ship-eslint.log`, `/tmp/merchant-ship-build.log`, `/tmp/merchant-ship-go-tests.log`, `/tmp/merchant-ship-go-lint.log`, `/tmp/merchant-ship-go-build.log`. User authorized pushing this merchant extension and the final icon refinements to main.
