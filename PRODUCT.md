# Product

## Register

product

## Users

**Dual audience, single surface.**

- **Investment researchers & analysts** — fund managers, strategists, equity researchers using this as a reference tool. They need precision, scanability, and data integrity. Primary mode: scan KPI cards → read tables → verify numbers. They notice rounding errors and will cross-reference against their own models.
- **Tech executives & founders** — decision-makers getting a quick, memorable mental model of where AI profit pools concentrate. They value narrative clarity over exhaustiveness. Primary mode: absorb the Sankey flow visually → read the three observation callouts → leave with the headline (e.g. "NVIDIA + MSFT + TSMC = 38%").

Both audiences share one need: **trust**. The report must feel like a leaked internal strategy memo, not a marketing dashboard. Every number must be traceable; every design choice must signal rigor.

## Product Purpose

A single-page interactive report that answers one question with two lenses: **who captures the profit in the 2026 AI value chain?**

- **Geo lens**: How do profits distribute across sovereign blocs (US, China, Taiwan, Korea, Japan, Europe)?
- **Layer lens** (NVIDIA Five-Layer Cake): How do profits distribute across Energy → Chip → Computing Infra → Model → Application?

The Sankey diagram is the primary information carrier. Supporting elements (KPI dashboard, ledger tables, observation notes) reinforce and annotate, never compete.

Success is: someone opens the page, spends 30 seconds absorbing the Sankey, leaves with three numbers they'll recall in a meeting.

## Brand Personality

**Authoritative, elegant, restrained.**

Like a Financial Times weekend data feature: confident typography, white space as punctuation, the gravity of the data speaks for itself. The restraint *is* the expertise signal.

- **Voice**: Clinical but not cold. Numbers-first, but the observations have a point of view. It says "here's what the data shows" not "here's what we think."
- **Emotional goal**: Quiet confidence. The reader should feel they've been handed something serious — the kind of document you read before a big meeting, not something you skim and close.
- **Tone calibration**: The copy uses precise language ("≈ 38.5%" not "roughly 40%"), mono fonts for all numbers, and the serif headings carry the editorial weight. No exclamation marks, no superlatives, no marketing adjectives.

## Anti-references

- **Bloomberg Terminal density**: No information overload, no tiny text, no 50 data points competing on one screen. The report has exactly one hero (the Sankey) and supporting elements that don't fight it.
- **SaaS dashboard template**: No rounded cards (`border-radius: 12px+`), no gradient accents on KPI boxes, no soft drop shadows, no "modern data tool" chrome. This is a document, not a dashboard.
- **Data-art / decorative visualization**: No animated counters, no particle effects, no "wow" transitions that delay comprehension. Motion serves clarity (focus transitions, view switches), never decoration.
- **AI-generated warmth**: No cream/beige/sand backgrounds, no warm-tinted neutrals. The dark background (`#0B0D10`) is a deliberate choice — it makes the amber accent read as urgent and the colored flows pop against near-black.

## Design Principles

1. **The Sankey is the protagonist.** Every layout decision starts from "does this help or hinder reading the Sankey?" The rail is 180px (not 320px) because the Sankey needs the space. The KPI bar is thin because the Sankey is the headline.

2. **Numbers earn their place.** Every data point on screen carries semantic weight. The amber accent is reserved for the primary narrative (US+Chip dominance). Colors are assigned by entity identity, not decoration.

3. **Restraint signals rigor.** Sharp corners (`border-radius: 2px`), mono data fonts, dashed separators, stamped labels — the industrial aesthetic says "this is a working document." The design's refusal to decorate is itself a trust signal.

4. **One surface, two reading modes.** The same layout serves both the 30-second scan (Sankey flow + KPI numbers + observation headers) and the 5-minute deep read (hover interactions, ledger tables, observation body text). Nothing is hidden behind tabs or modals.

5. **Traceability is non-negotiable.** Every number links to a source in `docs/methodology.md`. The footer lists sources. Data integrity checks (`assertBalance`) run on load. If a number is wrong, the reader can trace why.

## Accessibility & Inclusion

- **WCAG Level AA** target. The dark theme (`#0B0D10` bg, `#E8E6E1` ink) achieves strong contrast. Colored flows use distinct hues (amber, crimson, slate, moss, ash) that remain distinguishable under common forms of color vision deficiency.
- **Keyboard navigable**: Sankey nodes are focusable via Tab, Esc clears focus. Buttons use native `<button>` elements.
- **Screen reader**: The SVG has `role="img"` and `aria-label`. Tables use semantic `<table>` markup.
- **Reduced motion**: The current CSS transitions (200ms opacity on hover) are brief and functional. Any added motion must respect `@media (prefers-reduced-motion: reduce)`.
- **Font loading**: Google Fonts CDN with system font fallbacks. The page remains readable while web fonts load or if they fail.
