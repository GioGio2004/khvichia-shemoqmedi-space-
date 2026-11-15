# Finish report

The portfolio finishing plan (`docs/PORTFOLIO_PLAN.md`), worked on 14 and 15 November 2026 on branch `feat/portfolio-finish`.

**Not deployed.** Nothing is pushed; production (https://khvichia.shemoqmedi.space) still runs the build from before this work. Every result below was measured on local builds.

## Status by phase

| Phase | Status |
|---|---|
| 0 Inventory and baseline | Done: `docs/INVENTORY.md`, `scripts/qa-shots.mjs`, baseline screenshots (in `qa/`, not committed) |
| 1 Polish fixes | Done |
| 2 Content model | Done, with the open owner decisions as `TODO(owner)` |
| 3 Case-study pages | Done and reviewed (27 review findings: 21 fixed by the reviewer's fixer, the rest by hand or listed below) |
| 4 Gallery entry points and accessibility | Done |
| 5 About, credentials, recruiter path | Done |
| 6 Motion, performance, reduced motion | Done |
| 7 Responsive and accessibility QA | Partly: a full sweep was started and stopped by the owner (too slow); a lighter check replaced it (see below) |
| 8 Metadata, SEO, submission kit | Done; the kit is marked not ready until deployed and checked live |
| 9 This report | Done |

## Section 2 findings

| # | Finding | Status |
|---|---|---|
| 2.1 | Outlined name glitches | Fixed: an overlap-free static Inter 600 (`scripts/outline-font.py`, `src/assets/fonts/`) for every outlined text; checked in a 3x zoom of "Khvi" |
| 2.2 | Kencho Room slide grey and shadowed | Fixed in the shader (bright pictures are dimmed more), so every slide lands dark; the Kencho Room slide now shows the room itself, not its START screen |
| 2.3 | Carousel has no story | Fixed: eyebrow, one line, role and status per project, and three actions |
| 2.4 | Low contrast in skills panels | Fixed: per-card `--dim`, `--slash` and `--soft` values at 3:1 or more (4.5:1 for the small counts), checked against the grained colour |
| 2.5 | Skills read as a tool wall | Fixed: each tool names the projects whose code uses it; the MCP slogan became a fact. Lists not trimmed (D9) |
| 2.6 | Dead gap in the contact sheet | Fixed: intro paragraph and actions fill it; addresses no longer break mid-word at tablet widths |
| 2.7 | Hero label wraps | Fixed: it has two columns; where it must wrap, the lines are balanced and the dot sits by the first |
| 2.8 | Carousel title collides with the frame | Fixed: the title block hangs just above the panel's top edge at every width |
| 2.9 | Discipline bar is a dead end | Fixed for three of four: links to the case studies; "Hardware" stays plain until D1 |
| 2.10 | Photo frames have no context | Not changed: needs D12 (his own captions) |
| 2.11 | Hackathon and GITEX missing | Fixed: on the new About sheet, worded from his CV (D4 still to confirm) |

## Changed files, by phase

- **Phase 0:** `scripts/qa-shots.mjs` (QA screenshots), `docs/INVENTORY.md`, `.gitignore` (qa/), dev dependencies `playwright-core` and `@axe-core/playwright`.
- **Phase 1:** `scripts/outline-font.py`, `src/assets/fonts/inter-latin-600-outline.woff2`, `src/work/shader.ts`, `src/work/layout.ts`, `src/hero/Hero.tsx`, `src/content/hero.ts`, `src/content/skills.ts`, `src/about/Skills.tsx`, `src/about/Stack.tsx`, stylesheet rules (now in `src/base.css` and `src/home.css`).
- **Phase 2:** `src/content/work.ts` (gallery cards), `src/content/cases.ts` (case-study text and pictures), `src/content/profile.ts`, `src/content/stack.ts` (`usedIn`), `src/content/sites.ts`. Facts were checked against each project's own repository on this machine.
- **Phase 3:** `case.html`, `src/case/*`, `src/entry-server.tsx`, `scripts/prerender.mjs`, `vite.config.ts`, `vercel.json` (clean URLs, no trailing slash), `scripts/og.mjs` and `public/og/*.png`, `public/sitemap.xml`, `public/llms.txt`.
- **Phase 4:** `src/work/Work.tsx`, `src/work/Gallery.tsx`, `src/lib/scroll.ts` (shared Lenis, `holdScroll`), `src/lib/retry.ts` (3D parts retry once if their file fails to load).
- **Phase 5:** `src/components/Menu.tsx` (About sheet, Contact intro, CV and Email in every menu, focus trap and return), `src/components/Mark.tsx`, `src/content/sections.ts`, `src/lib/sheet.ts`, `src/footer/Footer.tsx` (Contact button).
- **Phase 6:** `src/base.css` and `src/home.css` (split from `src/styles.css`), `src/frames/Frames.tsx` (still list for reduced motion), `src/footer/Footer.tsx` and `Letters.tsx` (static finale, redraw on demand), `src/content/road.ts` (photo sizes), `src/main.tsx`, `src/case/main.tsx`.
- **Phases 7 and 8:** gallery button names, monogram and caption-link tap areas, CreativeWork data on case pages (`src/entry-server.tsx`, `scripts/prerender.mjs`), `scripts/stills.mjs` and `docs/submission/*.jpg`, `docs/SUBMISSION_KIT.md`, this report.

## Checks, stated as they happened

- **Lint (oxlint) and typecheck (tsc -b):** pass.
- **Build:** passes; six pages prerendered (`/`, four case studies, `404`).
- **Accessibility (axe), final run:** 0 violations on the home page (scrolled through, and with the About and Contact sheets open), the four case pages and the 404 page, at 1440 and 390, with and without reduced motion.
- **Console:** no errors or hydration warnings. Two expected messages remain: the 404 page's own 404 status, and a deprecation warning from inside three.js (`THREE.Clock`), not from this code.
- **Horizontal overflow:** none on any page at 1440 or 390.
- **Links:** every internal link answers 200; both CVs download as `application/pdf`; GitHub, the four project sites and the LinkedIn post answer 200; LinkedIn's profile answers 999 to scripts (its usual block, not a broken link).
- **Touch targets at 390:** the remaining small boxes (monogram, "All work", discipline links) have invisible hit areas of 44 px or more.
- **Normal motion unchanged by Phase 6:** every home state and case page at 1440 and 390 was compared pixel by pixel before and after; 114 of 137 pairs are identical and the rest differ only in antialiasing, the pulsing dot or grain.
- **Visual spot checks (this session):** hero, gallery, Bery, footer end and About sheet at 1440 and 390 in both motion modes; case pages at 1440 and 390.
- **Not done:** the full 7-width sweep of every state was stopped partway, so 1920, 1024, 768, 375 and 320 were not all re-checked after the last changes (they were checked earlier, before Phase 6, for the case pages). Safari and Firefox were not tested (Edge only). Vercel's clean-URL and 404 behaviour is untested until a deploy.

## Performance after the speed pass (15 November, Lighthouse 13, local server)

Changes: the pulsing dot no longer repaints the page every frame (it animated a box-shadow); smooth scrolling starts on the first scroll instead of running a frame loop from load; React takes the page over section by section; the closed menu sheets are not laid out until the menu opens; the outline font and the smooth-scroll code load after the page; the page script loads after the page has loaded (or on the first interaction). Nothing visible changed.

| Page | Runs: Performance | Accessibility, Best Practices, SEO |
|---|---|---|
| Home, mobile | 100, 100, 99 | 100 on every run |
| Home, desktop | 100, 100 | 100 |
| Kencho Room case, mobile | 99, 100, 100 | 100 |
| Kencho Room case, desktop | 100 | 100 |

Mobile home went from a median of 83 to 100: TBT from about 640 ms to under 10 ms on most runs, first paint about 0.9 s. A single 99 on mobile is run-to-run noise on this machine (the same build scores 100 on the next run); the metric that still sits just under full marks on those runs is LCP at about 1.85 to 1.97 s. Live results will differ with the real network: measure again after deploying.

## Performance before the speed pass (Lighthouse 13, local server, 3 runs, medians)

| Page | Performance | LCP | TBT | CLS | Other categories |
|---|---|---|---|---|---|
| Home, mobile | 83 (75 to 93) | 1.96 s | 644 ms | 0 | 100 |
| Home, desktop | 100 | 0.49 s | 15 ms | 0 | 100 |
| Kencho Room case, mobile | 93 | 2.16 s | 277 ms | 0 | 100 |
| Kencho Room case, desktop | 100 | 0.54 s | 23 ms | 0 | 100 |
| Live site today, home mobile | 83 | 2.20 s | 595 ms | 0 | 100 |
| Live site today, home desktop | 100 | 0.54 s | 18 ms | 0 | 100 |

Local numbers have a faster network than production. Mobile scores swing widely between runs on this machine. Memory stays flat over 5 round trips home, case page, home (about 5.7 MB at the bottom of home); the case pages create no WebGL context; the footer letters stopped drawing when idle (1086 draw calls in 3 s before, 0 after).

## Open owner decisions (all marked `TODO(owner)` in the code)

- **D1:** "Hardware" or "Learning systems" as the fourth discipline (`src/content/hero.ts`; also `index.html` and `public/llms.txt` mention hardware).
- **D2:** availability line: keep "Available for select work, 2026/27" or "Open to remote frontend roles & select collaborations" (`src/content/profile.ts`).
- **D3:** university, title and start year for the lecturer credential (`profile.ts`; shown without them for now).
- **D4:** hackathon and GITEX wording (taken from his CV).
- **D5:** iframe permissions are as before (Shemoqmedi and Kalami allow only the real address).
- **D6:** was Kencho Room really submitted for an award? The case study says so; nothing in its code or site shows it.
- **D7:** jury: confirmed vs invited, and whether names may be shown.
- **D8:** a Kalami demo account for real product screens; the case study shows the public page's drawings, labelled as such.
- **D9:** trim the skill lists to tools used in the case studies (would remove Figma and Blender).
- **D10:** add SQL / SQL Server / C# to Engine.
- **D11:** "Bery" spelling.
- **D12:** real one-line captions for the photo frames.
- **D13:** permission to push for a Vercel preview.

Other points found while checking the facts:

- **Kencho Group authorship:** its git history shows Sabakhvichia1 wrote most of the August version and Giorgi the October rebuild that is live. The case study says "from the ground up"; confirm or reword.
- **Kalami and AI for students:** the code ships a read-only connector for a student's own assistant, but kalami.space says "No AI for students". The case study claims no student AI until this is settled.
- **Kencho Room status:** shown as "Live", not "Delivered", until the client sign-off is confirmed.
- **The CV** still describes shemoqmedi as the hackathon's AI menu assistant; the live site is the awards platform.

## After the plan (15 November)

- The gallery shows only the "Read case study" button under the slides.
- The case-study pages carry no pictures (the gallery's live preview shows each site); the captures and their scripts were removed. The Kencho Room slide's picture of the room moved to `src/assets/sites/kencho-room.webp`.
- The "Work / 0N of 04 · All work" tag beside the monogram on case pages was removed.
- The 3D gallery is no longer loaded with the page: it gets ready on the visitor's first mouse movement, scroll or touch, with a skeleton of its panels until it can draw. The side-scroll photos and the footer letters start right after it (`src/lib/ready.ts`).
- Two Phase 6 changes were taken back because they made the page unreliable: the side scroll's large photos are fetched ahead of time again (not lazily once on screen), and the footer letters are drawn on every frame while the footer is near (not "on demand").
- A split orange and charcoal loading screen with a counter was built and removed again at the owner's request.
- Both 3D canvases now take their size at once (`resize` on the Canvas in `Gallery.tsx` and `Letters.tsx`). By default React Three Fiber waits until the page has stood still for 50 ms before it measures and draws, so a canvas mounted during a scroll stayed empty for as long as the page kept moving. That was why the gallery and the footer letters sometimes did not appear.
- Lighthouse after all of this (local server, quiet machine): home mobile 96, 100, 99; Kencho Room case mobile 96, 100; home desktop 100; Accessibility, Best Practices and SEO 100 on every run. Scroll test with real wheel events at a normal and a fast pace: the gallery is ready when reached (about 0.6 s after the first movement), all seven photos are loaded, and the footer letters take the photos over on arrival.

## Not yet done

- The rest of the Phase 7 sweep (all widths after the last changes, Safari and Firefox).
- Deploy to a preview, check it there, then decide on production.
