# Dark Mode Design

**Date:** 2026-11-07
**Status:** Approved
**Branch:** `feat/redesign-mapa-transporte`

## Context

The app currently has a single light theme. All color tokens live in `src/app/globals.css` inside an `@theme inline` block. Tailwind compiles those tokens to fixed hex values, so overriding CSS variables at runtime would not affect the generated utilities. A dark mode therefore requires changing the token architecture or duplicating styles with `dark:` variants.

The user chose:

- A two-state light/dark toggle.
- First visit follows the system preference; after an explicit toggle, the choice is remembered.
- The toggle lives in the header, on the right.
- Dark mode uses a cold graphite palette while preserving the existing transit-signal identity.

## Goals

- Add a real dark mode across every view: home, import, review/edit, dashboard table, term plan, graph, and backups.
- Add a header symbol that toggles light/dark mode.
- Persist the user's explicit choice.
- Follow the system preference on first visit and while no explicit choice exists.
- Avoid a flash of the wrong theme on load.
- Keep the existing visual system: flat surfaces, 1px rules, cobalto/red/amber/green semantics, Barlow typography, hard rectangles.
- Keep all study-plan logic, parser, storage of plans, and backups unchanged.

## Non-Goals

- No three-state selector (light/dark/system) in the UI.
- No per-view theme settings.
- No change to the graph geometry or study-plan behavior.
- No new dependency.
- No commit, merge, or deploy unless explicitly requested.

## Architecture

### Theme model

- Theme values: `"light"` and `"dark"`.
- The active theme is stored on `<html data-theme="light|dark">`.
- `color-scheme` is kept in sync so native controls, scrollbars, and form widgets match.
- Storage key: `planificador-correlativas:theme:v1`.
- On first visit with no stored value, resolve from `window.matchMedia("(prefers-color-scheme: dark)")`.
- While no stored value exists, listen for system preference changes and update the theme.
- On toggle, write the explicit choice to `localStorage`; from then on the system preference is ignored.
- An in-memory explicit-choice flag also marks the choice for the session, so the system listener stops even if storage is unavailable.
- If storage access fails, apply the theme in memory for the session and continue without errors.

### Avoiding the theme flash

`src/app/layout.tsx` will include a small blocking inline script as the first child of `<body>` that:

1. Reads the stored theme.
2. Falls back to the system preference.
3. Sets `document.documentElement.dataset.theme`.
4. Sets `document.documentElement.style.colorScheme`.

The `<html>` element gets `suppressHydrationWarning` because the server cannot know the client theme.

### Token architecture

Change the root token block from `@theme inline` to `@theme static`. This makes generated utilities reference CSS variables such as `var(--color-canvas)` instead of fixed hex values, and guarantees that variables used only by custom CSS are emitted.

Light values remain in the `@theme static` block. Dark overrides go in:

```css
html[data-theme="dark"] {
  color-scheme: dark;
  /* dark token overrides */
}
```

Add text-on-color tokens so colored fills remain accessible in both themes:

- `--color-on-primary`
- `--color-on-signal`
- `--color-on-success`
- `--color-on-status`

Light values are `#ffffff`; dark values are dark graphite. Replace hardcoded white text on colored fills with these tokens.

### Component behavior

- `ThemeToggle` is a client component rendered in the header.
- The button is icon-only, 32px square, with `aria-label="Cambiar tema"` and a matching `title`.
- The icon swap is CSS-driven: moon in light mode, sun in dark mode. This avoids a hydration-time icon flip.
- A `useEffect` in `ThemeToggle` subscribes to `prefers-color-scheme` changes only while no stored preference exists.
- The toggle reads and writes `data-theme` directly; no global React context is needed because colors are resolved by CSS.

## Data Flow

1. Page loads.
2. The first inline body script resolves theme from storage or system and sets `data-theme` before the app content paints.
3. CSS variables select the light or dark palette.
4. `ThemeToggle` renders both icons; CSS shows the correct one.
5. User clicks the toggle.
6. Handler flips `data-theme`, updates `color-scheme`, and writes the explicit choice to `localStorage`.
7. On reload, the stored choice wins.
8. If no stored choice exists, system changes update `data-theme` live.

## Dark Palette

Cold graphite surfaces with the same transit semantics. Accent colors are lightened for legibility on dark backgrounds; on-color tokens keep text on filled accents readable.

```text
canvas              #0b0f12
surface             #11171a
surface-2           #182024
surface-3           #222c30
ink                 #e8efed
ink-soft            #a7b4b0
ink-faint           #85938f
line                #2b363a
line-strong         #465358

primary             #7fb0ff
primary-deep        #5f97f0
primary-soft        #16263c
signal              #ff7a75
signal-deep         #e05f5a
signal-soft         #2a1413
warning             #f0a44a
warning-soft        #2a1d0d
success             #4fd39a
success-soft        #0f2a20

status-pending      #9aa6aa
status-pending-soft #1a2226
status-progress     #f0a44a
status-progress-soft #2a1d0d
status-regularized  #5cc8f0
status-regularized-soft #102a35
status-approved     #4fd39a
status-approved-soft #0f2a20

on-primary          #08111f
on-signal           #1a0b0a
on-success          #06170f
on-status           #08111f
```

Semantics remain fixed:

- Cobalto: route, action, focus, selection, regularized edges.
- Red: block, error, destructive action, approved-final edges.
- Amber: in progress and attention.
- Green: approved and available.

## Files to Change

- `src/app/globals.css`: token architecture, dark overrides, on-color tokens, hardcoded white replacement, theme icon CSS.
- `src/app/layout.tsx`: inline theme script and `suppressHydrationWarning`.
- `src/components/icons.tsx`: `SunIcon` and `MoonIcon`.
- `src/components/import/import-plan-flow.tsx`: render `ThemeToggle` in the header.
- New `src/components/theme/theme-toggle.tsx`: toggle and system listener.
- New `src/lib/theme/theme.ts`: storage key, theme type, resolution helper.
- New `src/lib/theme/theme.test.ts`: resolution helper tests.
- `src/components/dashboard/status-meta.ts`: use `text-on-status` for active `in_progress`, `regularized`, and `approved` fills; `pending` keeps `text-ink`.
- `src/components/import/review-plan.tsx`: replace `text-white` on success fill.
- `src/components/import/upload-panel.tsx`: replace `text-white` on primary fill.
- `DESIGN.md`: dark mode tokens, behavior, and do/don't notes.
- `.impeccable/design.json`: dark palette metadata and narrative update.
- `docs/DEVELOPMENT.md`: theme storage key and behavior.

## Error Handling

- Inline script wraps storage access in `try/catch`; failure falls back to system preference.
- Toggle wraps `localStorage.setItem` in `try/catch`; theme still changes for the session.
- System listener wraps storage access in `try/catch`; if storage is blocked, the in-memory explicit-choice flag stops the listener for the session.
- Invalid stored values are ignored and resolved from the system preference.

## Edge Cases

- No JavaScript: the app renders the light theme.
- System dark preference with no stored choice: dark theme on load.
- User toggles to light while system is dark: light persists after reload.
- User toggles to dark while system is light: dark persists after reload.
- System preference changes while no stored choice: theme updates live.
- System preference changes after an explicit choice: theme does not change.
- Storage blocked: toggling still applies the theme and stops system following for the session.
- Storage cleared: next load follows the system preference again.
- Clearing the study plan does not clear the theme preference.

## Testing

- Unit tests for theme resolution:
  - Stored `"dark"` wins over system light.
  - Stored `"light"` wins over system dark.
  - Invalid stored value falls back to system.
  - No stored value falls back to system.
- `npm run check`.
- `npm run build`.
- Playwright smoke test:
  - Light and dark at 1440px and 390px.
  - Home, review, dashboard table, term plan, and graph.
  - Toggle persists after reload.
  - Toggle works in every view.
  - No console errors.
- Visual check for contrast in dark mode, especially small status text, graph labels, fields, and service alerts.

## Documentation

- Update `DESIGN.md` with the dark palette and theme behavior.
- Update `.impeccable/design.json` with dark color metadata and narrative.
- Update `docs/DEVELOPMENT.md` with the storage key and toggle behavior.

## Acceptance Criteria

- A header symbol toggles between light and dark mode.
- The choice persists across reloads.
- First visit follows the system preference.
- No flash of the wrong theme on load.
- Every view is readable and consistent in dark mode.
- Light mode is visually unchanged except for accessible on-color tokens.
- `npm run check` and `npm run build` pass.
- No study-plan logic, parser, plan storage, or backup behavior changes.
