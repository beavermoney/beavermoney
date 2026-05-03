# Product

## Register

product

## Users

Beaver Money serves three overlapping audiences, in priority order:

1. **Hands-on finance enthusiasts.** Self-directed people who want full control over their money picture. They log transactions intentionally rather than rely on bank-sync automation. They look at net worth, cash flow, and category breakdowns weekly, sometimes daily. They are at a desk on a real keyboard most of the time, on mobile when they need to capture a transaction in the moment.

2. **Self-hosters and privacy-conscious users.** Developers and privacy-minded folks escaping commercial finance SaaS (Mint, Copilot, Monarch). They want their data on their own infrastructure, no telemetry, no upsell, no surprises. They picked Beaver Money in part because it is open source.

3. **Multi-person households.** Partners, roommates, and families who need a shared financial picture. They coordinate on spending, investments, and obligations across multiple people. Household switching and per-household roles (admin, member) are core to their flow, not edge cases.

Multi-household and multi-currency support cut across all three groups. They are defining features of the product, not optional extras.

The primary task on any given screen is one of: log something that happened, look at what is true right now, or notice a pattern over time.

## Product Purpose

Beaver Money is a personal finance app for people who want to own and understand their numbers. It tracks transactions, accounts, investments (stocks and crypto), recurring subscriptions, and balance snapshots across multiple households and currencies. It is open source and self-hostable.

It exists because the dominant alternatives (Mint and its successors) treat finance as content (ads, insights you didn't ask for, gamified savings), while spreadsheet alternatives treat it as a chore. Beaver Money treats it as a craft: small, deliberate inputs over time produce an accurate, trustworthy picture, the way a beaver's daily work produces a dam.

**Success, three months in:** the user looks at their net worth, cash flow, and category breakdown and feels *this is real, I understand it, no surprises*. Trust in the numbers is the win. Habit, insight, and behavior change are downstream of trust.

## Brand Personality

Three words: **honest, deliberate, friendly**.

- **Honest.** No inflated metrics, no fake celebrations, no insights manufactured to drive engagement. If a number is approximate (FX-converted, market-quoted), say so. If a feature is missing, say so. Open source is the default, not a footnote.
- **Deliberate.** Manual logging is a virtue, not an apology. Design rewards intent: keyboard-first input, considered defaults, no autopilot. The product respects the user's attention rather than spending it.
- **Friendly.** Warm, plain-spoken, occasionally playful (the beaver tagline, the dam metaphor). Never corporate-stiff. Never infantilizing. The voice of a thoughtful tool a friend built and maintained, not a bank.

The emotional goals are calm and confidence, not delight or excitement. A user closing the app should feel *I know where I stand*, not *that was fun*.

## Anti-references

The strongest pull to resist is **commercial bank-app glossiness**. The category gravity is heaviest there.

1. **Commercial finance apps (Mint, consumer banks).** No glossy gradients, no pushy upsells or feature ads, no infantilizing copy ("You spent $X on coffee this week!"), no fake celebration confetti, no emoji-laden cheerleading. Money is serious; treat the user as an adult.

2. **Crypto-bro dashboards.** No neon-on-black, no cyberpunk gradients, no dramatic glow effects, no hype copy ("TO THE MOON"), no aggressive magenta-on-dark. Beaver Money tracks crypto without becoming a crypto app.

3. **Generic AI-SaaS templates.** No hero-metric template (big number + small label + supporting stats + gradient accent), no gradient text, no lavender-and-cyan duotone, no identical card grids of icon + heading + paragraph. The first thing someone should think looking at this is "a tool", not "a landing page".

If a screen could be reskinned with a different name and pass for a SaaS template, it has lost.

## Design Principles

Five strategic principles guide every design choice in Beaver Money. They are about stance, not styling.

1. **Accuracy is the feature.** The product's job is to make the numbers true and trustworthy. UI must never round when precision matters, never hide what was logged, never romanticize a chart. When values are converted (FX), quoted (market), or estimated, surface that fact at the value, not in a footnote. Privacy mode masks; it never lies.

2. **Manual logging is intentional.** The user chose to log by hand. Honor that. Input must be fast and keyboard-first, with sensible defaults that learn from prior entries. Never frame manual entry as the fallback for missing automation; frame it as the point. Friction belongs only at decisions, never at re-typing what the system already knew.

3. **Builder, not bank.** The aesthetic and tone of a tool a thoughtful person built for themselves, not a service a corporation sold them. Sharp corners, dense layouts, type discipline, no decorative chrome. No tutorials disguised as marketing, no badges, no streaks. The UI signals craft and care, the way Linear, Raycast, and GitHub do.

4. **Plural by default.** Multi-household, multi-currency, and multi-person are not premium features or edge cases. Every screen assumes the user can switch context. The household switcher and the display-currency picker are first-class controls, always reachable, never buried in settings. Currency conversion is shown in line with the value, not hidden.

5. **Open about being open.** Self-hostability and open source are not fine print, they are part of why this exists. The tone never apologizes for the project being small, never pretends to be enterprise. No telemetry sneaks in, no SaaS upsell appears, no feature is gated behind a plan. The license, the repo, and the Discord are visible because they are part of the offer.

## Accessibility & Inclusion

**Target: WCAG 2.2 AA**, applied across the product surface.

Specific commitments:

- **Reduced motion respected.** Any animation honors `prefers-reduced-motion: reduce`. Animation is purposeful, never decorative; removing it never removes information.
- **Color-blind-safe chart palette.** The seven domain chart roles (net-worth, liquidity, investment, property, receivable, liability, asset) use distinct hue plus distinct lightness combinations so they remain distinguishable in deuteranopia and protanopia. Charts also encode meaning beyond color (labels, position) wherever feasible.
- **Keyboard-first throughout.** Every action reachable from the mouse must be reachable from the keyboard, including transaction entry, household switching, and chart interactions. The command menu (cmdk) is a first-class navigation surface.
- **Privacy mode as inclusion.** The privacy toggle that masks financial values is itself an accessibility feature: it lets users open Beaver Money over a stranger's shoulder, on a shared screen, or in a public space without exposing personal data. Treat it as a real surface, not a gimmick.
- **Honest about gaps.** Where a target is not yet met (for example, complex chart screen-reader summaries), say so in the docs rather than overclaim. Honesty is the brand.
