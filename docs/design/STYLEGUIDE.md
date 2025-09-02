# Habit Tracker – Design System (v1)

This style guide documents the visual foundations and component rules for the redesigned app. All tokens are implemented as CSS variables in `src/index.css` and consumed by Button, Card, Input, and navigation.

## Foundations

- Colors: Light/Dark variables
  - Primary: `--color-primary` / `--color-primary-600`
  - Surfaces: `--color-surface`, `--color-card`, `--color-elevated`
  - Text: `--color-text`, `--color-muted`
  - Accents: `--color-accent`, `--color-success`, `--color-danger`, `--color-warning`
- Radius: `--radius-sm` (8), `--radius-md` (12), `--radius-lg` (16)
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- Focus: `.focus-ring` yields a consistent accessible outline

## Typography

- Base size: 14–16px, scale up for headers
- Use Tailwind font utilities but keep contrast strong for dark mode

## Components

- Button
  - Variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`, `soft`, `link`
  - Sizes: `xs`, `sm`, `md`, `lg`, `icon` (10x10)
  - Focus & disabled states are consistent across variants
- Card
  - Uses `card-surface` class (tokenized), avoid ad‑hoc colors in cards
  - Header → Title → Content → Footer structure
- Input
  - Tokenized border/background/text and a primary focus ring

## Layout

- App header: blurred surface with gradient logotype; keep it 48–56px high on mobile
- Bottom nav: tokenized, larger targets, clear active state
- Dashboard: main content left, optional side panels right; on small screens use a single column

## Accessibility

- Respect `prefers-reduced-motion`
- Sufficient color contrast in both themes
- Keyboard focus visible using `.focus-ring`

## Micro-interactions

- Keep animations <200ms, ease-out
- Use subtle scale or background changes on press/hover

## Figma Hand-off (suggested pages)

- Foundations (colors, type, spacing, grid)
- Components (Button, Card, Input, Nav, Modals)
- Screens (Dashboard, Manage, Analytics, Streaks, Settings, Onboarding)

