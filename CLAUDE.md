# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page React + Vite + MUI web app that helps community-orchestra members generate paste-ready volunteer-hour descriptions for employer matching portals (e.g., Microsoft Give / Benevity). Deployed to GitHub Pages from `main` via `.github/workflows/deploy.yml`. Vite `base` is `/orchestra-volunteer-hours/`.

## Commands

- `npm run dev` — start the Vite dev server.
- `npm run build` — runs `prebuild` (content validation) → `tsc -b` → `vite build`. Use this to surface TypeScript errors; there is no separate `typecheck` script.
- `npm run lint` — flat-config ESLint (`js`, `typescript-eslint`, `react-hooks`, `react-refresh`).
- `npm run validate:content` — runs `scripts/validate-content.ts` via `tsx`. Loads every ensemble manifest + cycle JSON via the Node loader and parses it through the Zod schemas. **Run this after editing any file under `src/content/ensembles/`.** It also runs automatically before `build`.
- `npm run preview` — preview the production build.

There is no test suite.

## Architecture

### Content-driven ensembles

All ensemble data lives in `src/content/ensembles/<EnsembleId>/`:

- `*-manifest.json` (matched by glob `*manifest.json`) — ensemble metadata + brand theme. The ensemble `id` is **derived from the folder name**, not the file contents.
- `cycles/<cycle-id>.json` — one file per concert/board cycle. The cycle `id` is **derived from the filename** (sans `.json`).

Schemas in `src/ensembleProvider/ensemble.schemas.ts` (Zod) are the source of truth for shape. `EnsembleManifestSchema` and `ConcertCycleSchema` use `satisfies z.ZodType<Omit<…, 'id'>>` because the id is injected from the path.

#### Manifest format (`<EnsembleId>/<id>-manifest.json`)

```jsonc
{
   "name": "Solstice Symphony Orchestra",         // required, full display name
   "shortName": "Solstice",                       // required, compact label
   "dateAdded": "2025-12-31",                     // required, ISO date; sorts ensembles on the selection page
   "logoUrl": "solstice.webp",                    // optional, filename under public/assets/logos/
   "benevityId": "840-923822235",                 // optional, used to deep-link the Benevity portal
   "theme": {                                     // required brand theme; consumed by makeMuiTheme
      "primary":     "#FFB024",                  // required
      "secondary":   "#171A39",                  // optional
      "ink":         "#2B2B2B",                  // optional, body text color (default #000)
      "background":  "#FCF8EF",                  // optional, page background (default #FFF)
      "onPrimary":   "#171A39",                  // optional, text on primary (default = ink)
      "onSecondary": "#FCF8EF"                   // optional, text on secondary (default = primary or ink)
   }
}
```

Notes:
- `id` is **not** in the JSON — it comes from the parent folder name (`PSSO`, `Solstice`, …) and is what appears in the `?ensemble=` query param.
- `logoUrl` is a bare filename, not a path. Drop the file in `public/assets/logos/` and the loader prepends `${BASE_URL}assets/logos/`.
- Theme color fields are passed straight to MUI (`createTheme`) — any CSS color string works.

#### Cycle format (`<EnsembleId>/cycles/<cycle-id>.json`)

```jsonc
{
   "label": "PSSO 2025 Winter Concert (\"Forbidden Romance\")", // required, shown in the cycle picker
   "memo": "PSSO 2025 Winter Concert",                          // optional; defaults to label in the generated "Memo:" line
   "defaultDescription": "Volunteer service supporting …",      // required, prefills the Description field
   "cycleDate": "2025-03-01",                                   // required ISO date; sorts cycles newest-first
   "events": [                                                  // required array; order is preserved in the UI
      {
         "label": "Rehearsal #1",                              // required
         "date":  "2025-01-06",                                // required ISO date
         "start": "7:15pm",                                    // required, must match /^(\d{1,2}):(\d{2})(am|pm)$/i
         "stop":  "9:30pm",                                    // required, same format
         "breakTime": 15                                        // optional, minutes; default 0
      }
   ]
}
```

Notes:
- `id` comes from the filename (`winter-2025.json` → `winter-2025`) and is what appears in `?cycle=`.
- `start` / `stop` are **strings only**, not 24-hour times — the parser only accepts `h:mmam` / `h:mmpm` (case-insensitive). 24h strings or seconds will silently parse to 0.
- `breakTime` is the default downtime preselected for that event; the user can edit it in the UI, where it's clamped to `[0, duration]`.
- Events do not need to be sorted — the UI renders them in the order given. Sort them however reads best in the participation list.
- Within one cycle you can have multiple events on the same `date` (e.g., a rehearsal plus its setup/teardown crew slots) — see `PSSO/cycles/winter-2025.json`.

#### Cycle authoring conventions

These aren't enforced by the schema — they're conventions you should match when editing existing files or adding new ones:

- **Board cycles mirror the concurrent concert cycle's events.** Solstice publishes a "Board of Directors" cycle alongside each concert cycle and *duplicates every event from the concert cycle* (rehearsals, setups, concert, breakdown) on top of board-only events (board meetings, music library/bowing prep). This is so board members can log time monitoring rehearsals or setup as volunteer service. See `Solstice/cycles/board-2025.json` ↔ `Solstice/cycles/summer-2025.json` for the reference pair. When you add or edit a concert cycle, also update the corresponding board cycle.
- **Event ordering inside a cycle is by category, then chronological within each category.** Board cycles use: board meetings → music prep (bowing/library) → stage/concert events → rehearsals. Concert cycles use: rehearsals → stage events → concert. Don't sort the whole array by date — the participation UI reads better grouped this way.
- **`label` vs `memo`.** `label` is the user-facing string in the cycle picker and may include the program subtitle (e.g., `2026 Spring Concert ("American Echoes")`). `memo` is the shorter form embedded in the generated paste-text and typically omits the subtitle (e.g., `2026 Spring Concert`). When omitted, `memo` falls back to `label`.
- **Use `11:59pm` to represent "midnight"** for sessions that run to end-of-day. The time parser doesn't handle day rollover, and existing data uses `11:59pm` for this case (see `Solstice/cycles/board-2025.json` music library prep entries).
- **Round event times wide to 5-minute boundaries** when transcribing from raw notes (round `start` *down*, `stop` *up*). Members will adjust per-event downtime in the UI if they want a tighter credit; defaulting wide gives them the most flexibility.

### Dual loaders sharing a core

Loading is split into three files because the same content must be read from both Vite (browser bundle) and Node (validation script):

- `loadEnsembles.core.ts` — pure logic. Parses path strings via `parseEnsemblePath`, validates with Zod, sorts cycles (newest first by `cycleDate`), and builds the `EnsembleRegistry` (`{ ensembles, byId }`).
- `loadEnsembles.vite.ts` — uses `import.meta.glob('../content/ensembles/*/*manifest.json')` and `…/cycles/*.json`. Resolves `logoUrl` against `import.meta.env.BASE_URL` + `assets/logos/`.
- `loadEnsembles.node.ts` — uses `fast-glob` + `fs.readFile`. Used only by `scripts/validate-content.ts`.

Both loaders feed `buildRegistryFromSources(...)` with the same `SourceLoader[]` shape, so validation and runtime go through identical parsing.

Logos referenced by `manifest.logoUrl` are looked up under `public/assets/logos/<filename>` — they live in `public/`, not in `src/content/`. The `src/assets/logos/` folder is for app-chrome logos imported as ES modules (e.g., `MicrosoftLogo`).

### Ensemble + cycle selection (URL-driven, no router state)

`EnsembleProvider` (`src/ensembleProvider/EnsembleProvider.tsx`) is the app shell:

1. Loads the registry asynchronously, shows `<LoadingScreen />` until ready.
2. Reads `?ensemble=…&cycle=…` via `useQuerySelection` (`ensembleSelection.ts`), which mirrors selection into `window.history` (push/replace) and listens to `popstate`. There is no `localStorage` — the URL is the single source of truth.
3. Reconciles invalid IDs in an effect (clears `cycleId` if the ensemble doesn't have it; clears the whole selection if `ensembleId` is unknown).
4. Builds an MUI theme via `makeMuiTheme(selectedEnsemble?.theme)` so the app re-themes when an ensemble is chosen.

`AppRoutes` is intentionally minimal: a single `path="*"` that renders `EnsembleSelectionPage` or `VolunteerHoursPage` based on whether `selection?.ensembleId` is set. Don't add new routes — selection is encoded as query params, not paths.

### Volunteer hours model

`src/pages/VolunteerHoursPage/volunteerHours.model.ts` exposes `useVolunteerHoursModel({ ensemble, cycle })` and owns all page state. Key behaviors to preserve when editing:

- **Hydration effects** depend on the `ensemble` / `cycle` object identity. They reset `orgName`, `eventName`, `description`, and `participation` whenever the selection changes.
- **Generated vs. draft text:** `generatedOutput` is recomputed from inputs; `draftOutput` is what the user sees in the textarea. A small state machine (`hasManualEdits`, `lastGeneratedApplied`) decides whether to overwrite the draft when inputs change, and exposes `showStaleWarning` when the user has edited but inputs have since drifted. `regenerateText()` re-syncs.
- **Credit math:** `computeCreditedMinutes` clamps `downtimeMinutes` to `[0, duration]` so a malformed downtime can't produce negative credit. Times in cycle JSON are parsed by the regex `/^(\d{1,2}):(\d{2})(am|pm)$/i` in `volunteerHours.utils.ts` — only that format is supported.

`volunteerHours.utils.ts:toUtcDate` parses ISO date strings at noon UTC to avoid TZ-shift bugs when formatting; keep `formatDay` calls going through it.

## Conventions

- **Indentation is 3 spaces** (`.prettierrc` `tabWidth: 3`), single quotes, trailing commas `es5`, print width 120. Match this when editing — most files use 3-space indent and it's load-bearing for diffs.
- TypeScript is strict-by-default via `tsconfig.app.json`; the `tsc -b` step in `build` is the type-check.
- React 19 + MUI v7 + `react-router-dom` v7. The app uses `BrowserRouter` with `basename={import.meta.env.BASE_URL}` so deep links work under the GitHub Pages subpath.
- Adding an ensemble: create `src/content/ensembles/<Id>/<id>-manifest.json` plus one or more `cycles/*.json`, drop the logo in `public/assets/logos/`, then run `npm run validate:content`.
