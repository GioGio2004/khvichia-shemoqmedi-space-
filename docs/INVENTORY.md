# Inventory (Phase 0)

What the site was made of when the finishing plan started (14 November 2026), and where each finding of the plan's Section 2 lived. Line numbers are from before the work; the files have since moved (see "Where things are now").

## Stack and structure

- **Framework:** Vite 8, React 19, TypeScript, plain CSS with custom properties (Tailwind is imported only for `sr-only`). No router: one page. No i18n.
- **Build:** `npm run build` runs `tsc -b`, `vite build`, an SSR build of `src/entry-server.tsx`, then `scripts/prerender.mjs`, which writes the rendered page into `dist/index.html`, inlines the stylesheet and preloads the Inter font.
- **Sections:** `src/App.tsx` renders Mark, Menu, Hero, Stack (Skills card + Interface / Engine / Around it), Work (curved WebGL gallery), Frames (photo side scroll, Bery is photo 4), Footer (GIORGI letters in WebGL).
- **Motion:** Lenis smooth scroll; GSAP is installed but the scroll effects are written by hand (`src/lib/useScrollFrame.ts`). three + React Three Fiber for the gallery and the footer letters, both lazy-loaded when near.
- **Tokens:** `--paper #fff`, `--ink #1c1c1c`, `--accent #ff4d00`, `--tab`, `--mute`, `--hair`, `--mono`, `--grain-pale`, `--grain-dark`, `--edge`, `--gutter`, `--menu-h`, `--ease`, `--out`.
- **Fonts:** Inter Variable (latin, wght 100 to 900, woff2 only); Anton only for the no-WebGL footer fallback.
- **CVs:** `public/cv/Giorgi-Khvichia-CV.pdf` and `-KA.pdf`, made by `npm run cv` from `scripts/cv-content.mjs`.

## Gallery order (from `src/content/sites.ts`)

Shemoqmedi, Kencho Room, Kencho (renamed Kencho Group), Kalami: four sites, shown as `01 / 04` to `04 / 04`. The row repeats the list to fill eight slots. Shemoqmedi framed live only on the deployed addresses, Kalami only on `khvichia.shemoqmedi.space`, the two Kencho sites everywhere.

## Baseline

- `npm run lint` (oxlint): clean.
- `npm run build`: passes; one Vite warning that the lazy react-three-fiber chunk is 918 kB (242 kB gzip).
- QA screenshots: `npm run build` then `npm run qa:shots` (see the header of `scripts/qa-shots.mjs`).

## Where each Section 2 finding lived

| # | Finding | Where | Cause |
|---|---|---|---|
| 2.1 | Outlined name glitches | `.menu-name` and the stack's `outline` effect, `src/styles.css` | `-webkit-text-stroke` on the variable Inter outlines each overlapping stroke (K, v) |
| 2.2 | Kencho Room slide grey and shadowed | `src/work/shader.ts` backdrop `* 0.5` | a cream screenshot times 0.5 is mid grey, so the screen's shadow showed; Kalami had it too |
| 2.3 | Carousel has names but no story | `src/work/Work.tsx`, `sites.ts` `kind` | only name, a two-word kind and the count |
| 2.4 | Low contrast in skills panels | `.stack-names` dimming `opacity: 0.22`, slashes, `--soft` on orange | dimmed names 1.4 to 2.1 to 1, slashes about 1.7 to 2.5, counts on orange 2.97 |
| 2.5 | Skills read as a tool wall | `src/content/stack.ts` notes, `skills.ts` "the future of automation" | notes were descriptions, not evidence |
| 2.6 | Dead gap in the contact sheet | `.menu-contact` `justify-content: space-between` with two children | up to 450 px empty at tablet widths; addresses broke mid-word from 761 to 1000 px |
| 2.7 | Hero label wraps | `.hero-about` one column, max 20rem | wrapped from 761 to 1316 px, dot centred between lines |
| 2.8 | Carousel title collides with frame | `.work-head` top offset vs panel top at 23.75% | the small line touched or crossed the panel at 1440 and wider |
| 2.9 | Discipline bar is a dead end | `src/hero/Hero.tsx` band, `hero.ts` fields | hover looked like links, none were |
| 2.10 | Photo frames have no context | `src/content/road.ts` captions | short personal captions |
| 2.11 | Hackathon and GITEX missing | nowhere on the site | only in the CV |

## Other defects found then

- Menu: Tab skipped the opened links; no focus trap or return; the contact sheet had no dialog semantics.
- Footer: its `--ink` progress value shadowed the colour token; no way to open Contact from it.
- 320 px: the Around it card's foot and Bery's name clipped by a few pixels.
- Live iframe had no sandbox, loading state or timeout; Enter on the gallery opened the live preview, not a case study.
- No `og:image`, no CreativeWork data, sitemap with one URL.

## Where things are now

- Styles: `src/base.css` (shared: tokens, monogram, menu, sheets), `src/home.css` (home page), `src/case/case.css` (case pages).
- Projects: `src/content/work.ts` (gallery card fields) and `src/content/cases.ts` (case-study text and pictures). Credentials and About text: `src/content/profile.ts`.
- Case pages: `case.html`, `src/case/*`, prerendered to `dist/work/<slug>/index.html`.
