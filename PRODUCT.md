# Product

## Register

product

## Users

Beaver Money is built for people who track their finances **manually, on purpose**. Logging every transaction by hand is the feature, not the friction. The act of typing it in is what creates awareness; auto-importing from Plaid would defeat the point.

Three concentric audiences:

1. **The deliberate manual logger.** Tracks every income, expense, transfer, and investment lot themselves. Distrusts auto-aggregators. Wants accuracy down to the cent and the share.
2. **The household, not the team.** Couples, partners, families sharing finances under one roof. Each person can view the household combined or scoped to their own activity. Roles matter (member, admin, owner) without becoming SaaS-speak.
3. **The self-hoster.** Someone who runs the stack on their own server because their financial data shouldn't live on someone else's marketing roadmap. Reads changelogs, files issues, opens PRs.

Context of use: a few minutes most days to log what happened, then longer planning sessions weekly or monthly to review trends, net worth, and shared decisions.

## Product Purpose

A complete personal-finance ledger you operate yourself: transactions, accounts, investments (down to lots), recurring subscriptions, multi-currency conversion with synced FX rates, and household-shared views.

Success looks like:

- Every transaction this week was logged on purpose, by a human who knows what was spent and why.
- The whole financial picture (assets, liabilities, investments, property) is visible in one place, in any currency the household chooses.
- Two people in the same household can review the month together, or each can drill into just their own activity. Both views are equally first-class.
- Investment values reflect real synced quotes; FX-converted balances stay accurate without manual maintenance.
- The user knows their data lives where they put it. Nothing is held hostage.

Existing capabilities (already shipped) include household management, transaction logging, account tracking, investment tracking with lot-level detail, multi-currency with conversion, recurring subscriptions, snapshots, privacy-mode masking, and OAuth login. The design must respect this scope and make it feel inevitable.

## Brand Personality

**Sharp, precise, transparent.**

- **Sharp**: terse copy, fast surfaces, keyboard-friendly. No tutorial overlays explaining obvious things. Trust the user.
- **Precise**: numbers are the substance; never round them away, never decorate them. Every alignment, every column, every decimal place is intentional.
- **Transparent**: open-source ethos shows up in the interface. No dark patterns, no hidden state, no "premium" gates. What you see is the whole product.

Tone of voice: direct, matter-of-fact, occasionally dry. The beaver/dam metaphor exists ("Log your transactions. Build your dam.") but stays understated; never folksy, never anthropomorphic past the logo. We're a tool, not a mascot.

Lineage we'd be proud to sit beside: Linear, Stripe Dashboard, Raycast, Tailscale, Notion, Obsidian, Beancount/Ledger, YNAB, and the current generation of polished personal-finance managers (Monarch, Copilot, Lunch Money). Manual-first like Beancount, calm and dense like Stripe, keyboard-first like Linear, document-feeling like Notion.

## Anti-references

What Beaver Money is **not**:

- **Auto-aggregator dashboards** (Mint, Plaid-driven Copilot configurations, anything that pulls transactions for you). The whole product is built against this premise. The interface should never imply auto-import is "coming soon" or that manual entry is a fallback.
- **Gradient-led visuals**. No `background-clip: text` gradient headlines, no gradient cards, no gradient hero metric. Solid colors, weight contrast, scale contrast. Color is semantic (chart roles, destructive, primary), not decorative.
- **Crypto/DeFi neon-on-black aesthetics**. Speculative, hype-coded, untrustworthy with money. Even the dark theme stays warm-neutral, not cyberpunk.
- **Big-bank legacy fintech**. Navy-and-gold, stock photos of smiling families, "wealth management" copy. Stiff and performative.
- **Robinhood-style gamification**. No confetti, no green/red dopamine, no streaks-as-engagement-loop. The reward for logging is awareness, not animation.
- **Generic AI-slop SaaS landing**. Hero metric with soft glow, identical icon-heading-text card grids, pastel everything. If a stranger could guess "this is fintech" from a 50ms glance at a gradient and a chart, we've failed.

## Design Principles

1. **Manual is the feature, not the friction.** Every interaction around logging (transaction entry, lot creation, category assignment) should feel like the most respected path in the app, not a tedious one. Speed, keyboard, defaults, recall. The tagline `Build your dam` is operational, not decorative.

2. **Numbers first, chrome last.** Tabular density is a feature, not a problem to hide behind cards. Align decimals, monospace numerics where useful, vary spacing for rhythm rather than wrapping every figure in a container. The user came to read totals; deliver totals.

3. **Household and individual are co-equal views.** Anywhere a value exists, the user should know whether they're seeing combined-household scope or their own scope, and switching should be one move. Never default to "user is alone"; never default to "everything is shared". Make the scope visible in the chrome.

4. **Accuracy is the trust contract.** Lot-level investments, synced FX, historical rates, snapshot integrity, decimal precision. Nothing in the design rounds, hides, or simplifies the underlying numbers without an explicit affordance. If a value is converted, the original is one hover or click away.

5. **Self-hosting earns first-class treatment.** Surfaces around install, config, data export, and version transparency are not marketing afterthoughts. Errors are honest. The interface admits what it can't do today (and what's intentional, like auto-import).

## Accessibility & Inclusion

- **WCAG 2.2 AA** as the enforced baseline: 4.5:1 contrast for text, full keyboard navigation, ARIA labels on icon-only controls, focus rings always visible, no color as the sole signal (especially in chart legends and account-type indicators).
- **Reduced motion** is respected. `prefers-reduced-motion` disables non-essential transitions, keeps necessary feedback (focus, state) without parallax, slide, or decorative motion.
- **Privacy-mode masking** is a first-class accessibility feature, not just a parlor trick: the existing `usePrivacyMode` toggle replaces sensitive numerics so the app stays legible in cafes, on shared screens, in screenshares, in screenshots for support tickets. Treat it as required for any new financial value rendered.
- **Internationalization** awareness: locale-driven currency formatting (`Intl.NumberFormat`), date formatting, currency code visibility. Long account names and translated labels must not break tabular layouts.
- **Density tolerance**: dense data is read for long sessions. Default font sizes and line-height should remain comfortable at typical desk distance; avoid over-compression even when fitting more rows is tempting.
