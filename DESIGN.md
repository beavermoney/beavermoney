---
name: Beaver Money
description: Log your transactions. Build your dam.
colors:
  beaver-pelt-amber: "oklch(0.852 0.199 91.936)"
  beaver-pelt-amber-deep: "oklch(0.681 0.162 75.834)"
  primary-foreground: "oklch(0.421 0.095 57.708)"
  paper-white: "oklch(1 0.002 92)"
  ledger-ink: "oklch(0.145 0.005 92)"
  warm-mist: "oklch(0.967 0.005 92)"
  workshop-fog: "oklch(0.97 0.005 92)"
  pencil-line: "oklch(0.922 0.005 92)"
  ring-graphite: "oklch(0.708 0.008 92)"
  alarm-red: "oklch(0.577 0.245 27.325)"
  bench-canvas: "oklch(0.985 0.005 92)"
  chart-net-worth: "oklch(0.72 0.19 142)"
  chart-liquidity: "oklch(0.67 0.2 258)"
  chart-investment: "oklch(0.78 0.17 55)"
  chart-property: "oklch(0.65 0.22 340)"
  chart-receivable: "oklch(0.7 0.18 200)"
  chart-liability: "oklch(0.65 0.22 25)"
  chart-asset: "oklch(0.72 0.17 300)"
typography:
  display:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  none: "0"
  sm: "0"
  md: "0"
  lg: "0"
  xl: "4px"
  pill: "9999px"
spacing:
  px: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  sidebar-collapsed: "2.5rem"
  sidebar-expanded: "12rem"
components:
  button-primary:
    backgroundColor: "{colors.beaver-pelt-amber}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 8px"
    height: "28px"
  button-primary-hover:
    backgroundColor: "{colors.beaver-pelt-amber}"
    textColor: "{colors.primary-foreground}"
  button-outline:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ledger-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 8px"
    height: "28px"
  button-ghost:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ledger-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 8px"
    height: "28px"
  badge-default:
    backgroundColor: "{colors.beaver-pelt-amber}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "20px"
  card:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ledger-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ledger-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 8px"
    height: "28px"
  dialog:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ledger-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: Beaver Money

## 1. Overview

**Creative North Star: "The Builder's Workbench"**

Beaver Money looks like a clean, well-lit workshop. Tools laid out on amber pine. Sharp, square edges everywhere except where a dialog softens the corner just enough to invite. Numbers are the work; the surface holds them and gets out of the way. Small daily marks (a transaction, a price refresh, a snapshot) accrete into something solid, the way a beaver's daily work becomes a dam.

Every visual decision serves accuracy, restraint, and craft. The amber primary is warm but disciplined: it appears where it earns its place (a single primary action, a household marker, the beaver pelt accent in the sidebar) and never floods the canvas. Type is small, dense, and consistent (Inter Variable, body-12 relaxed, weights 400 to 600 only). Surfaces are flat. Where two surfaces meet, a 1px ghost ring at 10% foreground separates them. No shadows, no gradients, no decorative chrome.

This system explicitly rejects three things, in priority order. It rejects **commercial bank-app glossiness**: no marketing hero metrics, no celebration confetti, no infantilizing copy. It rejects **crypto-bro maximalism**: no neon, no glow, no gradients masquerading as data. It rejects **AI-SaaS templates**: no "icon plus heading plus paragraph" card grids, no gradient text, no lavender-and-cyan duotones. If a screen could be reskinned with a different name and pass for a SaaS template, it has lost.

**Key Characteristics:**

- Sharp by default. Radius is 0 across buttons, inputs, cards, the sidebar. The only soft corner is the dialog (4px) and the only round corner is the badge (full pill).
- Compact and earnest. Default control height is 28px. Default body type is 12px with 1.625 line-height. The UI respects screen real estate the way a workbench respects bench space.
- Flat with ghost rings. Surfaces never lift. Cards, popovers, and dialogs are separated from the canvas by a 1px subtle ring at 10% foreground.
- Plural by default. Currency conversion, household identity, and member roles are first-class visual citizens, never modal afterthoughts.
- Tonal layering for depth. Light theme uses (canvas → card → popover) as a near-flat lightness ramp. Dark theme inverts it: a deeper canvas, slightly lifted card, subtle popover.

## 2. Colors

The palette is amber-warm-on-near-neutral. One committed accent (Beaver Pelt Amber) carries identity; everything else is a tinted-toward-warm neutral so the accent reads as warmth, not as decoration. Charts get their own dedicated semantic palette because financial roles are not interchangeable.

### Primary

- **Beaver Pelt Amber** (`oklch(0.852 0.199 91.936)` light, `oklch(0.795 0.184 86.047)` dark): the single committed accent. Used on the primary call-to-action, the active household marker, the beaver-pelt sidebar primary, and the brand mark itself. Paired with **Primary Foreground** (`oklch(0.421 0.095 57.708)`), a deep warm brown that gives buttons readable contrast without pure black on amber.
- **Beaver Pelt Amber Deep** (`oklch(0.681 0.162 75.834)`): the deeper sibling that lives in the sidebar primary slot. Slightly more orange, slightly more saturated, used to mark the active workspace identity.

### Neutral

Every neutral is tinted toward the brand hue (92°) at chroma 0.003 to 0.01, scaled by lightness (less chroma at the extremes, more in the mid-greys where the eye tolerates warmth). Pure `#fff` and pure `#000` are forbidden. Light theme:

- **Paper White** (`oklch(1 0.002 92)`): primary canvas, card, popover background.
- **Bench Canvas** (`oklch(0.985 0.005 92)`): sidebar background, a single step warmer than canvas.
- **Workshop Fog** (`oklch(0.97 0.005 92)`): muted backgrounds, accent backgrounds.
- **Warm Mist** (`oklch(0.967 0.005 92)`): secondary surface, a degree warmer than Workshop Fog.
- **Pencil Line** (`oklch(0.922 0.005 92)`): borders, input borders, dividers.
- **Ring Graphite** (`oklch(0.708 0.008 92)`): focus ring base.
- **Ledger Ink** (`oklch(0.145 0.005 92)`): primary foreground text.

Dark theme inverts: canvas (`oklch(0.145 0.005 92)`) is the page, card and popover lift to (`oklch(0.205 0.008 92)`), borders become 10% tinted white. Same role names, same warm tint, inverted lightness.

### Tertiary (semantic alarm)

- **Alarm Red** (`oklch(0.577 0.245 27.325)` light, `oklch(0.704 0.191 22.216)` dark): destructive actions only. Never decorative, never used to signal urgency on neutral data. Always paired with the tinted-background pattern: 10% background, full-saturation text and icon. The full red surface is reserved for alerts that must be impossible to ignore.

### Chart Roles (semantic, color-blind aware)

Seven domain-specific chart colors map to financial concepts. Each one is a distinct hue plus a deliberate lightness, chosen so they remain distinguishable in deuteranopia and protanopia:

- **Net Worth** (`oklch(0.72 0.19 142)`): leaf green. The single most important number gets the most cognitively positive hue.
- **Liquidity** (`oklch(0.67 0.2 258)`): clear water blue. Liquid assets, cash flow.
- **Investment** (`oklch(0.78 0.17 55)`): orange. Adjacent to the amber primary on purpose; investments are part of the household's working capital.
- **Property** (`oklch(0.65 0.22 340)`): magenta. Hard assets, real estate.
- **Receivable** (`oklch(0.7 0.18 200)`): teal. Money owed to the household.
- **Liability** (`oklch(0.65 0.22 25)`): warm red. Debts and obligations.
- **Asset** (`oklch(0.72 0.17 300)`): violet. Generic asset roll-up.

A grayscale ramp (`chart-1` through `chart-5`) handles non-semantic chart contexts (sparklines, monochrome breakdowns). Light theme runs `oklch(0.87 0.005 92)` to `oklch(0.269 0.008 92)` (light to dark on light canvas). Dark theme is lifted into the readable band on dark canvas: `oklch(0.97 0.003 92)` to `oklch(0.45 0.008 92)` (light to mid-light on dark canvas, so all five remain visible).

### Named Rules

**The One Amber Rule.** Beaver Pelt Amber appears on no more than one primary action per panel and one identity marker per screen. Anywhere else amber appears, it is decoration and must be removed. The accent's rarity is the point.

**The Tinted Destructive Rule.** Destructive actions use a 10% Alarm Red background with full-saturation text and icon. Never a fully red button. Destructive is a serious moment, not a loud surface.

**The Honest FX Rule.** When a value is converted across currencies, surface that fact at the value (a small currency code or a tooltip), not in a footnote. Privacy mode masks; it never lies.

## 3. Typography

**Display Font:** Inter Variable (system-ui fallback)
**Body Font:** Inter Variable (system-ui fallback)
**Label Font:** Inter Variable (system-ui fallback)

**Character:** A single typeface family, Inter Variable, used in restricted weights (400, 500, 600). The result is consistency without monotony: hierarchy comes from scale and weight contrast, not from font switching. This is the typography of a tool, not a magazine.

### Hierarchy

- **Display** (600, 1.875rem / 30px, line-height 1.15, letter-spacing -0.02em): the rare hero, used on the landing page and onboarding. One per page maximum.
- **Headline** (600, 1.125rem / 18px, line-height 1.3, letter-spacing -0.01em): page titles inside the app shell. Mostly silent; the data is the headline.
- **Title** (500, 0.875rem / 14px, line-height 1.4): card titles, panel titles, dialog titles.
- **Body** (400, 0.75rem / 12px, line-height 1.625): the dominant register. Transaction rows, table cells, descriptions, button text. Cap line length at 65 to 75 characters when the body is prose; in tabular contexts, density wins.
- **Label** (500, 0.625rem / 10px, line-height 1.4): badges, status pills, small uppercase markers. Use sparingly; below 12px is harder to read.

### Named Rules

**The Three-Weight Rule.** The system uses 400, 500, 600. No 300, no 700, no italics. If you reach for a fourth weight, restructure the layout instead.

**The Body-12 Rule.** Default body is 12px. The system is built for users at a real keyboard, on a real screen, doing focused work. Resist the impulse to bump up to 14px to feel "designed". The density is the design.

**The Tabular Numerals Rule.** Money values use tabular numerals (`font-variant-numeric: tabular-nums`). Numbers in columns must align by digit, always. Non-tabular money is a bug.

## 4. Elevation

The system is **flat by default, with ghost rings**. There are no box-shadows in the global token vocabulary. Surfaces are separated by a 1px ring at 10% foreground (the "ghost ring"), which reads as a near-invisible edge in light theme and a subtle highlight in dark theme. Depth, when needed, is conveyed by tonal shifts in background lightness, not by light.

The dialog overlay is the one place the system uses backdrop-filter (`backdrop-blur-xs` on `bg-black/80`), and only because a modal needs to mute the canvas behind it. The backdrop blur is not decorative; it's a clarity device.

### Surface Ramp

- **Canvas:** the page background (`paper-white` light, `oklch(0.145 0.005 92)` dark).
- **Card / Popover:** the same as canvas in light theme (separated by ghost ring); one step lighter than canvas in dark theme (`oklch(0.205 0.008 92)`).
- **Sidebar:** one step warmer than canvas (`bench-canvas` light, `oklch(0.205 0.008 92)` dark). The sidebar earns its slight lift because identity (household, navigation) lives there.
- **Dialog:** popover token plus 4px corner softening, plus a backdrop-filter overlay behind it.

### Named Rules

**The No-Shadow Rule.** Surfaces do not cast light. If a component needs to feel separated, use the ghost ring (1px, 10% foreground) or shift the background tone. Drop-shadow is forbidden.

**The Ghost Ring Rule.** Cards, popovers, and dialogs use `ring: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent)`. Not borders. A border claims edge; a ring whispers it.

**The Backdrop-Blur Exception.** Backdrop-filter blur is permitted only on the dialog overlay, where it functions to mute the live canvas behind a modal. It is never decorative. No glassmorphism.

## 5. Components

Components are **compact and earnest**. Default control height is 28px. Default text inside controls is 12px. Variants are small, sharp, and unceremonious. The interaction language is keyboard-first (focus rings are real, focus-visible is everywhere, the command menu is a first-class navigation surface).

### Buttons

- **Shape:** sharp (radius 0 on default; `xs` size shifts to negative-radius which still resolves to 0).
- **Heights:** `xs` 20px, `sm` 24px, `default` 28px, `lg` 32px. Icon-only sizes match. There is no "large hero" button.
- **Primary** (`button-primary`): Beaver Pelt Amber background, deep-brown foreground, 12px text, medium weight. Hover dims to amber/80%. Active translates 1px down (the only tactile press in the system).
- **Outline** (`button-outline`): transparent background, 1px border in `pencil-line`, foreground text. Hover fills to `input/50` and shifts text to full foreground.
- **Ghost** (`button-ghost`): no surface at rest. Hover fills to `muted` and shifts text. Used in toolbars and table actions.
- **Secondary** (`button-secondary`): `cool-mist` background. Used when "primary" would be too loud and "ghost" would be too quiet.
- **Destructive** (`button-destructive`): 10% Alarm Red background, full Alarm Red text. Hover deepens to 20%. Never a fully red surface.
- **Link** (`button-link`): primary-amber text, underline-offset 4px, underline on hover. Used inline.
- **Focus:** focus-visible adds a 2px amber-tinted ring at 30% saturation, plus a border shift to `ring`. Always reachable by Tab.

### Inputs

- **Style:** 28px tall, 1px `pencil-line` border, transparent-tinted background (`input/20` light, `input/30` dark). Padding 8px horizontal, 2px vertical. Body-12 text.
- **Focus:** ring shifts to `ring/30` (a subtle gray ring, not a glow). Border shifts to ring color.
- **Invalid:** ring becomes `destructive/20`, border becomes `destructive`. The state is visible but never alarming.
- **Disabled:** opacity 50%, pointer-events none.

### Cards

- **Corner:** sharp (radius 0).
- **Surface:** card background (paper-white light, `oklch(0.205 0.008 92)` dark).
- **Separation:** ghost ring (1px, 10% foreground). No border, no shadow.
- **Internal padding:** 16px on default (`py-4 px-4`), 12px on small (`py-3 px-3`).
- **Title:** 14px medium weight (`title` token).
- **Description:** body-12 in `muted-foreground`.
- **Image-first cards:** when the first child is an image, top padding goes to zero so the image bleeds to the corners.

### Badges (Pills)

- **Shape:** the only pill in the system (`rounded-full`). 20px tall.
- **Type:** label-10 medium weight.
- **Variants:** match button variants (default amber, secondary cool-mist, destructive 10% red, outline, ghost, link).
- **Use:** category tags, status markers, currency codes inline with values, count indicators. Not for primary actions.

### Dialogs

- **Corner:** soft (4px). The one rounded surface in the system, because a dialog is an interruption and the soft corner is an apology.
- **Surface:** popover token, ghost ring.
- **Overlay:** `bg-black/80` with `backdrop-blur-xs`.
- **Padding:** 16px.
- **Close affordance:** ghost icon button, top-right, 24px square.
- **Animation:** fade-in plus 95% zoom-in over 100ms. Reduced-motion respected.

### Sidebar

- **Width:** 12rem (192px) expanded, 2.5rem (40px) collapsed.
- **Surface:** `bench-canvas` (one step warmer than the page canvas).
- **Toggle shortcut:** Cmd/Ctrl-B is a first-class keyboard shortcut, persisted via cookie.
- **Identity:** the household switcher and the active-workspace marker live at the top, using the deep amber sibling (`Beaver Pelt Amber Deep`) so the workspace identity reads even when the page is amber-quiet.
- **Mobile:** transitions to a sheet (drawer from the side) at small breakpoints; the FAB nav (`mobile-fab-nav.tsx`) handles primary navigation on mobile.

### Tables and Tabular Money

The data layer is a table, conceptually. Money values are right-aligned, tabular-nums, and currency-coded inline. Multi-currency rows show the converted display currency primarily and the native currency as a small secondary line beneath.

### Charts

- **Use:** Recharts and Nivo Sankey for visualizations.
- **Color:** the seven semantic chart roles (Section 2). Generic ramps fall back to the gray scale.
- **Encoding:** every chart encodes meaning beyond color (label, position, pattern). Color-blind users get the chart, never the disability.
- **Reduced-motion:** entrance animations honored. Tooltips and brushes do not animate when reduced-motion is requested.

### Command Menu

- **Library:** `cmdk`.
- **Trigger:** keyboard-accessible from anywhere in the app shell.
- **Role:** first-class navigation surface, not a power-user secret. PRODUCT.md commits to keyboard-first; the command menu is the embodiment.

## 6. Do's and Don'ts

The line PRODUCT.md draws strategically, this section enforces visually.

### Do:

- **Do** treat amber as scarce. One primary action per panel, one identity marker per screen, the brand mark, and that is the budget.
- **Do** keep controls compact. 28px default control height. 12px body text. Density is the brand.
- **Do** use the ghost ring (1px, 10% foreground) for surface separation. Never a full border, never a shadow.
- **Do** keep corners sharp on every control and every card. The only soft corner is the dialog (4px). The only round corner is the badge (full pill).
- **Do** use tabular numerals for every money value. Money columns must align by digit.
- **Do** show currency conversion at the value, with the native amount as a secondary line. Never hide that a number was converted.
- **Do** respect `prefers-reduced-motion: reduce`. Animations are state feedback, not theater.
- **Do** make every action keyboard-reachable, including chart interactions, household switching, and transaction entry.
- **Do** treat privacy mode as a real surface. When values are masked, charts and totals must remain coherent.
- **Do** quote the Three-Weight Rule (400, 500, 600) and the Body-12 Rule when reviewing new screens.

### Don't:

- **Don't** flood the canvas with amber. If amber appears more than once per panel as an action color, it is decoration. Remove it.
- **Don't** use side-stripe borders (`border-left` or `border-right` greater than 1px as an accent). Forbidden by the impeccable shared laws and reinforced here. Use full ghost ring or background tint instead.
- **Don't** use gradient text or `background-clip: text`. Single solid colors only. Emphasis comes from weight or size.
- **Don't** ship glassmorphism. Backdrop-filter is permitted only on the dialog overlay. Anywhere else it is decorative and forbidden.
- **Don't** build the hero-metric template (giant number, small label, supporting stats, gradient accent). It is the SaaS cliché PRODUCT.md rejects most strongly.
- **Don't** use identical card grids of "icon plus heading plus paragraph". If you find yourself laying out three cards in a row that look the same, the structure is wrong, not the styling.
- **Don't** use neon or glow effects. No `box-shadow` colored beyond the ghost-ring 10% foreground. No `text-shadow`. Beaver Money tracks crypto without becoming a crypto app.
- **Don't** write infantilizing or celebratory finance copy ("You spent $X on coffee this week!", "Great job saving!"). Money is serious. Treat the user as an adult.
- **Don't** introduce em dashes in any UX copy or marketing surface. Use commas, colons, semicolons, periods, or parentheses.
- **Don't** add a fourth font weight, a third typeface, or italic body type. The system is built on Inter at three weights.
- **Don't** wrap data in cards by default. Tables are the right primitive for transactions, balances, and rows. Cards are for summaries, not for everything.
- **Don't** use `#000` or `#fff` directly. Every neutral is already tinted toward the brand hue (92°) at chroma 0.003 to 0.01; reach for `paper-white` or `ledger-ink` and the tint comes for free.
- **Don't** reach for a modal as the first answer. Inline editing, route-driven dialogs, and progressive disclosure beat a modal in almost every case.
