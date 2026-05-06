# DESIGN.md

## VoltAgent Style Baseline

This project follows a VoltAgent-inspired visual system for all new frontend work.

This is a product adaptation, not a literal clone.
Keep the existing information architecture and business flows, but restyle them with VoltAgent's visual language.

## Core Direction

- Dark-first UI
- Technical, agentic, developer-facing feel
- Crisp geometry with restrained rounding
- Strong contrast, sparse color usage
- Green used as signal and emphasis, not as decoration
- Interfaces should feel operational, fast, and intentional

## Color System

Use these as the canonical palette for new work and refactors:

- `--va-bg`: `#050507`
  Main app background
- `--va-surface`: `#101010`
  Cards, panels, tables, drawers
- `--va-border`: `#3d3a39`
  Default borders and containment lines
- `--va-text`: `#f2f2f2`
  Primary text
- `--va-text-muted`: `#b8b3b0`
  Secondary text
- `--va-text-soft`: `#8b949e`
  Metadata and tertiary text
- `--va-accent`: `#00d992`
  Primary highlight, active border, selected state
- `--va-accent-soft`: `#2fd6a1`
  CTA text or lighter accent fill
- `--va-link`: `#306cce`
  Links and focused states
- `--va-purple`: `#818cf8`
  Secondary categorization and data accents
- `--va-info`: `#4cb3d4`
  Informational callouts
- `--va-warning`: `#ffba00`
  Warning states
- `--va-danger`: `#fb565b`
  Destructive states
- `--va-success`: `#008b00`
  Success confirmations

## Typography

Typography should feel sharp and technical, not soft or playful.

- Hero or page headline:
  `system-ui`, 400, large, tight tracking
- Section heading:
  `system-ui`, 400
- Feature title:
  `Inter`, 600
- Body and button text:
  `Inter`, 16px, 400
- Caption and metadata:
  `Inter`, 14px, 500
- Code:
  `SFMono-Regular`, 12px to 14px

Prefer fewer weights.
Let spacing and contrast create hierarchy before increasing font weight.

## Spacing

Use an 8px base rhythm.

- Micro: 4px
- Tight: 8px
- Default: 16px
- Section: 24px
- Large section: 32px
- Wide breathing room: 40px to 48px

Avoid crowded admin panels.
Give filters, card headers, and dense table controls more breathing room than the current default.

## Radius

Use restrained rounding only.

- Small controls: 4px
- Inputs and buttons: 6px
- Cards and panels: 8px
- Pills and tags: 9999px

Do not use overly soft or bubbly radii.

## Elevation

Prefer borders over shadows.

- Default container:
  1px solid `--va-border`
- Emphasized container:
  3px solid `--va-border`
- Active or selected:
  2px solid `--va-accent`
- Floating modal or hero surface:
  deep shadow with subtle inner ring

Shadows should be rare and deliberate.
Most backend screens should look contained, not floaty.

## Components

### Cards

- Use `--va-surface`
- Default border: 1px solid `--va-border`
- Radius: 8px
- Header and body spacing should feel deliberate and slightly spacious

### Buttons

- Primary:
  dark surface with strong green signal treatment
- Secondary:
  charcoal surface with border
- Ghost:
  text-first, no heavy fill
- Destructive:
  use `--va-danger`, keep it crisp

Buttons should look like tools, not marketing pills.

### Inputs

- Dark surface
- Visible border
- Strong focus ring or border using `--va-link` or `--va-accent`
- Placeholder text should stay muted

### Tables

- Dark container background
- Strong row separators
- Hover state should be subtle charcoal lift
- Selected row or active item should use accent border or accent glow, not a loud fill

### Tags and Status

- Keep tags compact
- Use muted fills for neutral states
- Use accent, warning, danger, success only for meaningful signal

## Page Rules For This Project

These are specific to `new-api`.

### Dashboard

- Should feel like an operations console
- Charts sit on dark surfaces with controlled highlights
- Stats cards use strong containment and compact copy
- Avoid colorful gradients unless they are very restrained

### Token, Channel, User, Logs

- Use dense but readable admin layouts
- Toolbar actions should be grouped cleanly
- Primary action should be visually obvious
- Destructive actions should stay separated

### Auth Pages

- Use large dark hero surfaces and minimal chrome
- Keep a strong central form focus
- Avoid cute onboarding patterns

### Settings

- Settings should look like a control plane
- Prefer section cards with clear titles and concise descriptions
- Long forms should be broken into blocks with visible boundaries

## Interaction Rules

- Fast transitions only
- No playful bounce
- Hover should mostly change border, text, or background by a small step
- Selected states must be immediately legible
- Loading states should feel technical and quiet

## Implementation Notes

- Preserve existing React and Semi UI structure where practical
- Introduce CSS variables before hardcoding colors repeatedly
- Favor reusable admin theme tokens over one-off page styling
- When a page is touched, move it closer to this system instead of adding isolated styling hacks

## Design Review Heuristic

Before considering a page done, check:

- Does it feel darker, sharper, and more agentic?
- Is green used as a signal instead of decoration?
- Are borders doing more work than shadows?
- Does the layout feel operational rather than generic SaaS?
- Would this still read as VoltAgent-inspired without copying their branding?
