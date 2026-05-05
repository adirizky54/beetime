---
name: Bee Time
description: Time tracking for freelancers and small agencies, refined and unhurried.
colors:
  harvest-amber: "oklch(0.852 0.199 91.936)"
  harvest-amber-deep: "oklch(0.681 0.162 75.834)"
  harvest-amber-dim: "oklch(0.795 0.184 86.047)"
  amber-foreground: "oklch(0.421 0.095 57.708)"
  warm-ink: "oklch(0.153 0.006 107.1)"
  warm-parchment: "oklch(0.988 0.003 106.5)"
  warm-surface: "oklch(1 0 0)"
  warm-stone: "oklch(0.966 0.005 106.5)"
  warm-ash: "oklch(0.58 0.031 107.3)"
  warm-edge: "oklch(0.93 0.007 106.5)"
  destructive-ember: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "0.27rem"
  md: "0.36rem"
  lg: "0.45rem"
  xl: "0.63rem"
  "2xl": "0.81rem"
  pill: "1.17rem"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "6": "1.5rem"
  "8": "2rem"
  "12": "3rem"
components:
  button-primary:
    backgroundColor: "{colors.harvest-amber}"
    textColor: "{colors.amber-foreground}"
    rounded: "{rounded.md}"
    padding: "0 0.625rem"
    height: "2.25rem"
  button-primary-hover:
    backgroundColor: "oklch(0.852 0.199 91.936 / 80%)"
    textColor: "{colors.amber-foreground}"
    rounded: "{rounded.md}"
    padding: "0 0.625rem"
    height: "2.25rem"
  button-outline:
    backgroundColor: "{colors.warm-surface}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.md}"
    padding: "0 0.625rem"
    height: "2.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.md}"
    padding: "0 0.625rem"
    height: "2.25rem"
  button-destructive:
    backgroundColor: "oklch(0.577 0.245 27.325 / 10%)"
    textColor: "{colors.destructive-ember}"
    rounded: "{rounded.md}"
    padding: "0 0.625rem"
    height: "2.25rem"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.625rem"
    height: "2.25rem"
  badge-default:
    backgroundColor: "{colors.harvest-amber}"
    textColor: "{colors.amber-foreground}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.5rem"
    height: "1.25rem"
  badge-outline:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.5rem"
    height: "1.25rem"
  card-default:
    backgroundColor: "{colors.warm-surface}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
---

# Design System: Bee Time

## 1. Overview

**Creative North Star: "The Well-Used Notebook"**

Bee Time's visual language borrows from the honest materiality of a well-worn notebook: warm paper, precise ruled lines, a single pen that leaves amber traces. Nothing decorates for decoration's sake. Every element has a function and earns its place exactly the way a well-organized spread of notes does — structured, immediate, with warmth that comes from use rather than ornament.

The system is built for intermittent, focused use. A freelancer opening it mid-project doesn't want to be welcomed or guided. They want to find what they need, do it, and close the tab. Density is kept low; spacing breathes. Hierarchy is unambiguous. The amber accent marks where action lives, and then gets out of the way.

This system explicitly rejects the patterns listed in PRODUCT.md: the cluttered density of enterprise SaaS (Jira, Asana), the visual stagnation of legacy invoicing tools, the identity-less grid of Bootstrap admin templates, and the hollow performance of gradient-heavy startup SaaS with its glowing metric cards and hero numbers. Bee Time looks like it was designed by someone who had an opinion, not assembled from a Tailwind starter kit.

**Key Characteristics:**
- Single typeface, weight-driven hierarchy
- One accent color (Harvest Amber) used sparingly; its restraint makes it meaningful
- Warm neutrals throughout, no pure black or pure white
- Flat surfaces at rest; borders and rings carry definition, not shadows
- Very small border radius (0.45rem base): precise, not rounded-for-softness
- Full dark mode with identical semantic roles, not a color inversion



## 2. Colors: The Amber Palette

A single hue family: warm amber shifting from near-white parchment to deep amber-brown ink. The palette is monochromatic in intent. No secondary accent color exists; no blues, greens, or purples enter the system. Everything either supports reading (warm neutrals) or calls to action (amber).

### Primary

- **Harvest Amber** (`oklch(0.852 0.199 91.936)`): The sole accent. Used on primary buttons, default badges, active sidebar items, and interactive focus rings. Vivid warm yellow with enough chroma to be unmistakable without being aggressive. In light mode only, slightly higher lightness; dark mode uses Harvest Amber Dim.
- **Harvest Amber Dim** (`oklch(0.795 0.184 86.047)`): Primary button color in dark mode. Slightly deeper and more amber, maintains contrast against dark backgrounds.
- **Harvest Amber Deep** (`oklch(0.681 0.162 75.834)`): Sidebar active primary, chart midpoint. The color of aged amber or late-afternoon wood. Used where a more grounded amber is needed.
- **Amber Foreground** (`oklch(0.421 0.095 57.708)`): Text on amber backgrounds. Dark amber-brown, readable, maintains the warm hue of the system rather than breaking to a neutral dark.

### Neutral

- **Warm Ink** (`oklch(0.153 0.006 107.1)`): Primary foreground text in light mode, background in dark mode. Very dark warm neutral; hue 107 places it in warm gray-olive territory, never cold.
- **Warm Parchment** (`oklch(0.988 0.003 106.5)`): Sidebar and near-background surfaces. The nearest thing to white in the system, but tinted warm.
- **Warm Surface** (`oklch(1 0 0)`): Card and page background in light mode. Used for content surfaces that need to lift slightly above the sidebar.
- **Warm Stone** (`oklch(0.966 0.005 106.5)`): Muted backgrounds, hover states, accent background tints. The resting state of interactive surface.
- **Warm Ash** (`oklch(0.58 0.031 107.3)`): Muted foreground, placeholder text, secondary labels, table column headers. Mid-weight neutral with enough warmth to read as intentional.
- **Warm Edge** (`oklch(0.93 0.007 106.5)`): Borders and input strokes. Quiet but distinct.

### Semantic

- **Destructive Ember** (`oklch(0.577 0.245 27.325)`): Error states, destructive action text and backgrounds. A warm red that belongs to the amber family's hue neighborhood without being identical to amber. Never used decoratively.

### Named Rules

**The Single Warmth Rule.** Harvest Amber is used on at most 10% of any surface. It appears on primary action targets only: primary buttons, active navigation items, default badges. Its rarity is the signal. Introducing a second accent color is prohibited.

**The No Cold Neutral Rule.** All neutrals carry hue 107 (warm gray-olive). Never use pure gray (`oklch(L 0 0)`), blue-gray, or cool-shifted neutrals. When adding new neutral steps, stay within hue 104–110.



## 3. Typography

**Display / Body Font:** Geist Variable (with `sans-serif` fallback)

Bee Time uses a single typeface throughout: Geist Variable, a clean geometric sans-serif with humanist influences and a variable weight axis. There are no separate display and body fonts. Hierarchy is achieved entirely through weight and size contrast. The system is typographically quiet and does not announce itself.

**Character:** Precise and legible. Geist's geometric construction brings structure without the coldness of Inter or the stiffness of DM Sans. Its variable weight axis means transitions between heading weight (600) and body weight (400) are smooth rather than categorical. It reads as a tool for reading, not for impressing.

### Hierarchy

- **Display** (weight 600, 1.5rem / 24px, line-height 1.25, tracking -0.02em): Page-level section titles. Used at the top of major content areas where orientation matters. Appears rarely.
- **Headline** (weight 500, 1.125rem / 18px, line-height 1.4, tracking -0.01em): Card titles, dialog headings, subsection labels that anchor a content block.
- **Title** (weight 500, 1rem / 16px, line-height 1.5): Inline section labels, column group headers, named items in lists. The primary mid-weight label.
- **Body** (weight 400, 0.875rem / 14px, line-height 1.5): All prose content, table cells, form values, descriptions. The dominant text size across the app. Max line length: 65–75ch.
- **Label** (weight 500, 0.75rem / 12px, line-height 1.4, tracking +0.01em): UI chrome: table column headers, meta information, status chips, form field labels. All uppercase label use is prohibited; label-weight applies without case transformation.

### Named Rules

**The Weight-Carries Rule.** One font family, no exceptions. Hierarchy lives in font weight and size contrast (minimum 1.25× ratio between adjacent steps). Font family variation — serifs, monospaced alternates, secondary sans — is not a tool in this system.

**The Body Is 14px Rule.** Default UI text is `text-sm` (0.875rem). Do not use `text-base` (1rem) as the body size in data tables or form fields. 14px provides adequate density for a professional tool without becoming cramped.



## 4. Elevation

Bee Time is flat by default. Surfaces at rest carry no shadow. Definition comes from borders (`ring-1 ring-foreground/10` on cards, `border border-input` on inputs) and tonal background differences (sidebar at warm-parchment, content at warm-surface). The visual model is the notebook: pages and margins are distinguished by the paper edge, not by a drop shadow.

Shadows appear only when a surface is genuinely floating above the document — dropdowns, tooltips, dialogs, popovers, and hover-elevated cards. Even then, shadows are minimal: `shadow-xs` (1px y-offset, very low opacity) rather than diffuse ambient lifts.

The ring pattern on cards (`outline: 1px solid oklch(0.153 0.006 107.1 / 10%)`) is not a shadow substitute — it is structural, not decorative. It traces the boundary of the surface at 10% opacity so it reads clearly on any background without adding visual weight.

### Shadow Vocabulary

- **Floating surface** (`box-shadow: 0 4px 12px oklch(0 0 0 / 8%), 0 1px 3px oklch(0 0 0 / 5%)`): Dropdowns, popover menus, command palettes, dialogs. Two-layer shadow; ambient layer at 8%, definition layer at 5%.
- **Ambient lift** (`box-shadow: 0 1px 3px oklch(0 0 0 / 5%)`): Inline card hover states, subtle surface differentiation inside a content area.

### Named Rules

**The Rest Is Flat Rule.** A surface at rest has no shadow. Period. If you're adding `box-shadow` to a card, table, or list item in its default state, remove it and use a ring or background tint instead.

**The Two-Layer Float Rule.** Floating surfaces (dropdowns, dialogs, tooltips) always use a two-layer shadow: an ambient spread at low opacity + a tight definition shadow. Single-layer shadows read as accidental; two layers read as intentional depth.



## 5. Components

Refined and restrained: tight radius, measured padding, no decorative embellishment. Components do exactly what they say, then stop.

### Buttons

A five-variant hierarchy with clear role separation.

- **Shape:** Gently rounded (0.36rem / ~6px). Subtle enough to read as rectilinear at a glance; present enough to soften the edge. Not pill-shaped; pills are reserved for badges.
- **Primary** (Harvest Amber fill, amber-foreground text, px-2.5, h-9): The single amber-filled button on a surface. Used for the primary progressive action: create, save, submit.
- **Hover / Focus:** Primary hover reduces to 80% opacity. Focus ring is `ring-3 ring-ring/50` — warm gray ring, not amber. Active state translates Y by 1px.
- **Outline** (background fill, border-input stroke, warm-ink text, shadow-xs): Secondary actions and cancel paths. Looks anchored, not subordinate.
- **Ghost** (no background, no border): Tertiary actions, inline icon-buttons, table row actions. Disappears until hovered.
- **Destructive** (destructive-ember/10 background, destructive-ember text): Irreversible actions. Never uses amber. 10% opacity background keeps it subdued until the user consciously reaches for it.
- **Link** (no background, amber text, underline on hover): Inline contextual links only.

### Badges

Pill-shaped status indicators. Small (h-5, text-xs) and compact.

- **Default** (Harvest Amber fill, amber-foreground text, pill radius): Active statuses, primary labels.
- **Outline** (no fill, warm-edge border, warm-ink text): Secondary statuses, neutral states, archived markers.
- **Destructive** (destructive-ember/10 fill, destructive-ember text): Error or failed states.
- **State:** No badges are interactive by default. When used as a link badge, hover applies an 80% opacity transition.

### Cards / Containers

Cards are used sparingly, not as the default content wrapper. The Frame component (a bordered container with the table body inside) is the more common data structure.

- **Corner Style:** Rounded-xl (0.63rem / ~10px). Larger radius than buttons; distinguishes structural containers from interactive elements.
- **Background:** Warm Surface (`oklch(1 0 0)`) in light mode; slightly lifted warm dark in dark mode.
- **Ring:** `outline: 1px solid oklch(0.153 0.006 107.1 / 10%)` at -1px offset. Traces the card boundary without adding visual weight.
- **Shadow:** `shadow-xs` only — 1px definition shadow, never ambient spread.
- **Internal Padding:** 1.5rem (24px) default; 1rem (16px) for `size="sm"` cards. Internal sections (header, content, footer) share the same horizontal padding.
- **Nested Cards:** Prohibited. Never place a card inside a card.

### Inputs / Fields

- **Style:** Transparent background, `border-input` stroke (warm-edge), rounded-md (0.36rem), h-9 (36px). Inputs float on the content background rather than presenting a filled field.
- **Focus:** `border-ring` + `ring-3 ring-ring/50` — the border color shifts to the warm gray ring token, and a 3px spread ring appears at 50% opacity. Warm, unobtrusive.
- **Error / Invalid:** `border-destructive` + `ring-3 ring-destructive/20`. The stroke shifts to destructive-ember; the ring signals invalidity at low opacity.
- **Disabled:** `pointer-events-none`, `opacity-50`. No custom treatment — reduction in opacity communicates the state.
- **Placeholder text:** Warm Ash (`oklch(0.58 0.031 107.3)`). Readable but clearly subordinate to entered values.

### Navigation

The app shell uses a collapsible inset sidebar (16rem expanded, 3rem icon-only collapsed), persistent across all `/$orgSlug/*` routes.

- **Sidebar background:** Warm Parchment (`oklch(0.988 0.003 106.5)`), one step warmer than the content background.
- **Nav items:** 2rem height, px-2.5, rounded-md. Default state: Warm Ash text, no background. Hover: Warm Stone background, darker foreground. Active: Warm Stone background, Warm Ink foreground, font-weight 500. No amber fill on active items (the sidebar primary uses Harvest Amber Deep for icons only, not backgrounds).
- **Typography:** text-sm (0.875rem), weight 400 default, 500 active.
- **Collapse behavior:** Collapses to icon-only via keyboard shortcut (Ctrl/Cmd+B). Collapsed state shows icons only; no labels, no tooltips by default except on demand.
- **Mobile:** Renders as a Sheet drawer at mobile widths.

### Data Table

The primary data presentation pattern in Bee Time. Used for projects, clients, members, timesheets.

- **Frame variant:** Table body is wrapped in a `Frame` component that gives it its own rounded border (rounded-xl) and `shadow-xs`. The table body cells use border-separate/border-spacing-0 to create a bordered grid effect within a rounded container.
- **Headers:** text-muted-foreground (Warm Ash), font-medium, h-10, no background. Column headers do not use uppercase or letter-spacing.
- **Rows:** 1px bottom border in light mode. Hover: `bg-muted/72` (Warm Stone at 72%). Selected: same as hover. Never amber row highlights.
- **Cell padding:** px-2.5 horizontal, text-sm.

### Empty State

Used when a list, table, or section has no content yet.

- **Container:** Dashed border (`border-dashed`), rounded-lg, p-12, centered text.
- **Icon variant:** Icon wrapped in a 2.5rem rounded-lg muted background (Warm Stone).
- **Title:** text-lg, font-medium, tracking-tight.
- **Description:** text-sm/relaxed, Warm Ash, max 65ch. Link in description uses underline + amber hover.
- **CTA:** Single primary button, centered below the description.



## 6. Do's and Don'ts

### Do:

- **Do** use Harvest Amber only on the single primary action on a given surface: one primary button, active nav item, or default badge. Never two amber-filled elements competing in the same viewport area.
- **Do** use `ring-1 ring-foreground/10` for card boundaries. This single outline pattern defines cards consistently across light and dark mode.
- **Do** use weight contrast of at least 1.25× between adjacent type hierarchy levels. Display (600) to body (400) is the full span; headline (500) sits squarely in the middle.
- **Do** use tonal background shifts (Warm Parchment sidebar, Warm Surface content, Warm Stone hover) to create depth without shadows.
- **Do** keep body text at 0.875rem (text-sm). 1rem (text-base) is reserved for display and modal content that needs extra readability at a distance.
- **Do** use OKLCH for all color values. The tonal ramp for each color in DESIGN.json provides 8 calibrated steps for derived states without guessing.
- **Do** respect `prefers-reduced-motion`: all transitions are `transition-*` with CSS custom property duration. Setting `--tw-transition-duration: 0` globally satisfies the preference without removing state visibility.
- **Do** ensure all text on Harvest Amber backgrounds uses Amber Foreground (`oklch(0.421 0.095 57.708)`), not black or white. This maintains hue coherence and passes WCAG AA contrast.

### Don't:

- **Don't** add a second accent color. There is no blue, green, purple, or teal in this system. The chart ramp, the amber family, and the warm neutrals are the full palette. Introducing a new hue for decoration is prohibited.
- **Don't** use enterprise SaaS patterns: nested dropdowns for primary actions, dense form grids, bulk-action toolbars visible at all times, modals for simple confirmations. These are the anti-patterns named explicitly in PRODUCT.md. Reach for inline editing, progressive disclosure, and toast confirmations instead.
- **Don't** replicate legacy invoicing tool aesthetics: full-width table borders, equal-weight column typography, no visual hierarchy between rows. Tables have hierarchy; headers are subordinate to values.
- **Don't** use Bootstrap admin template defaults: blue primary color, gray sidebar, identical padding on every surface, `h4` tags for every section header. Bee Time's identity comes from the amber palette and warm neutrals — any blue-shifted default is a regression.
- **Don't** build hero-metric layouts: large number, small label below, gradient accent card, at-a-glance KPI grid. The dashboard shows data; it does not perform it.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe. Rewrite with a full border, background tint, or leading icon.
- **Don't** use gradient fills on text (`background-clip: text`). Color emphasis uses weight or size, not gradients.
- **Don't** use glassmorphism (`backdrop-filter: blur`) as decoration. Floating surfaces use solid backgrounds; blur is not a depth signal in this system.
- **Don't** use pure black (`oklch(0 0 0)`) or pure white (`oklch(1 0 0)` without context). Every neutral in this system carries hue 107. Pure cold neutrals break the palette.
- **Don't** place a card inside a card. The result is always wrong. Use a list, a table row, or a flat section with a border instead.
