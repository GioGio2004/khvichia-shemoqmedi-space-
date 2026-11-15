# GIORGI KHVICHIA: PORTFOLIO FINISHING PLAN (v2.0)
**Date:** 14 November 2026
**Sources:** ChatGPT finishing brief v1.0 (the copy deck is kept in full as Appendix A), plus a jury-style visual review of the current site by Claude.
**Goal:** Turn the visually ambitious portfolio into a complete portfolio that backs every claim with evidence. It should land remote React/Next.js roles, win creative-development clients and be ready for an Awwwards submission, without losing the identity that makes it stand out.

> **How to use this file:** Copy it into the repo as `docs/PORTFOLIO_PLAN.md`. Claude Code works through the phases in order, ticks each `[ ]` checkbox in this file as it finishes it, and commits after every phase. If the session restarts or the context gets compacted, re-read this file and continue from the first unticked box.

---

## 0. OWNER DECISIONS (fill these in BEFORE running; Claude Code must not guess them)

Anything left blank becomes a `TODO(owner)` placeholder in code and in the final report. The answer is never invented.

| # | Question | Answer |
|---|---|---|
| D1 | The 4th hero discipline: keep `Hardware`, or change it to `Learning systems`? | |
| D2 | Replace "Available for select work — 2026/27" with `OPEN TO REMOTE FRONTEND ROLES & SELECT COLLABORATIONS`? (yes/no) | |
| D3 | University and title for the lecturer credential (e.g. "Lecturer, Georgian Technical University (GTU)"). Start year? | |
| D4 | Hackathon credential wording (e.g. "Winner, GCCI hackathon → represented at GITEX AI Berlin 2026"). Confirm the exact event names. | |
| D5 | Live URLs: Shemoqmedi / Kencho Room / Kencho Group / Kalami. May each one be embedded in an iframe? | |
| D6 | Kencho Room award submission: which award, and what is its current status? | |
| D7 | Shemoqmedi jury: how many members are confirmed and how many invited? May any names be shown? | |
| D8 | Kalami screenshots: a demo account with fake data (credentials go in `.env.local` only, never in chat or the repo). | |
| D9 | Skills pruning: approve trimming the lists to tools that appear in the case studies? (see P1-5) | |
| D10 | Add SQL / SQL Server / C# to Engine? (yes/no) | |
| D11 | Spelling of the honey badger's name: "Bery" is intentional? | |
| D12 | Photo-gallery captions: may the frames get real context (graduation, Berlin/GITEX AI, etc.)? Give one line per frame. | |
| D13 | May Claude Code push the branch to get a Vercel **preview** deployment? (Production deploys are never allowed in this run.) | |

---

## 1. What to keep (do not remove or redesign)
- The Swiss-grid hero: white/black, the orange accent token, the silhouette, the giant **Giorgi Khvichia.** name, the micro-labels and coordinates, and the discipline bar.
- The curved 3D work gallery with its cinematic transitions.
- The skills experience: **Interface / Engine / Around it** stacked panels with the animated type.
- The "a few frames" photography carousel, including **Bery the honey badger**.
- The giant **GIORGI** photo-masked type finale, the grain texture and the full-screen menu and contact overlay.
- The current strong Lighthouse performance. Don't regress it.

**Design principle:** Add evidence and clarity *inside* the existing art direction. Don't add generic SaaS cards, heavy shadows, decorative gradients, boilerplate timelines or unrelated effects.

---

## 2. Visual review findings (from a jury-style look at the current site)

The ChatGPT brief covers content and structure. These are concrete visual and polish defects it did not mention. Each one maps to a task in Phase 1.

1. **The outlined name glitches (contact overlay).** The orange outline "Giorgi Khvichia" shows internal overlapping contours in the **K** (a notch where the arm meets the stem) and at the base of the **v**. This happens when `-webkit-text-stroke` is used on a *variable* font. A juror would spot it immediately.
2. **The Kencho Room slide doesn't match.** Its inner frame has a grey panel with a heavy inner shadow, while the Shemoqmedi slide sits cleanly on dark. One of them looks unfinished.
3. **The carousel has names but no story.** "KENCHO ROOM, 3D FURNITURE ROOM" says nothing about role, problem or outcome. The bent-screen carousel is a known trope, so the content has to carry it.
4. **Resting contrast in the skills panels is too low.** Inactive words in the Engine panel are roughly #444 on #222 (about 1.6:1), and the slashes and footers are dim too. Large text needs at least 3:1.
5. **The skills read as a tool wall.** Listing Clerk, Resend, Web Push and Git as headline "skills", with "Every change, on GitHub." as a caption, reads junior. "MCP: the future of automation" is a slogan, not evidence.
6. **The contact overlay has a dead gap** between the giant name and the contact grid. It reads as empty rather than intentional. (The intro paragraph in Appendix A §4 fixes this.)
7. **The hero availability label** wraps awkwardly across two lines next to the orange dot.
8. **The carousel title collides with the frame.** The large project title sits on the top edge of the curved frame. Check it is a deliberate overlap at every breakpoint and not a collision.
9. **The discipline bar is a dead end.** "Web platforms / 3D experiences / AI tools / …" look like they should lead somewhere but don't.
10. **The photo frames have no context.** The graduation and Berlin photos are real credentials that currently read as random snapshots.
11. **The hackathon win and the GITEX AI Berlin 2026 trip are missing.** This is verifiable evidence that the ChatGPT brief leaves out entirely (pending D4).

---

## 3. Execution plan: phases with checkpoints

**Global rules for every phase**
- Work on branch `feat/portfolio-finish`. Commit at the end of each phase (`feat:`, `fix:`, `a11y:`, `perf:`, `docs:`). Never force-push, never deploy to production, and push only if D13 = yes.
- Don't install a new UI framework and don't replace the animation stack (GSAP, Lenis, Three/R3F). Dev-only test dependencies (`@playwright/test`, `@axe-core/playwright`) are allowed. Note each one in the report.
- Never invent outcomes, user counts, awards, dates, company names or URLs. Unknown values become `null` in data and `TODO(owner)` in the report.
- Run lint, typecheck and build at the end of every phase. A phase isn't done while any of them fails, unless the blocker is documented.
- "Tested" means actually checked in a browser or a Playwright screenshot. Never claim visual verification that didn't happen.

### Phase 0: Inventory and baseline (no feature code)
- [x] Create the branch. Read `package.json`, the router type (App Router, Pages Router or Vite), the section components, design tokens, fonts, the gallery implementation, the Lenis setup, i18n (if any), assets and the CV file paths.
- [x] Confirm the gallery order (expected: Shemoqmedi → Kencho Room → Kencho Group → Kalami). Note: the screenshots show "01/04" with Shemoqmedi and Kencho Room only, so check the real data.
- [x] Baseline: run lint, typecheck and build, and record the results.
- [x] Add `scripts/qa-shots.ts` (Playwright). It screenshots home (hero, skills × 3 panels, gallery × each slide, photo carousel, GIORGI finale, menu overlay, contact overlay) at **1920, 1440, 1024, 768, 390, 375 and 320**, once normally and once with `reducedMotion: 'reduce'`. Output goes to `qa/baseline/` (gitignored). **Look at the screenshots** and list any defects you find beyond §2.
- [x] Write `docs/INVENTORY.md`: components to reuse, where each §2 finding lives in the code, missing assets, and open D-items.
- **Checkpoint:** commit `docs: inventory and baseline`.

### Phase 1: Polish fixes from the review (fast, highly visible)
- [x] **P1-1 Outline glitch (§2.1).** Build a *static* instance of the display font with overlaps removed, and use it only for outlined text:
  `pip install fonttools skia-pathops brotli` →
  `fonttools varLib.instancer <Font[wght]>.ttf wght=<weight> --remove-overlaps -o Outline-Static.ttf` →
  `fonttools ttLib.woff2 compress Outline-Static.ttf`.
  Load it as a separate `@font-face` (e.g. `font-family: 'GK Outline'`) and apply it to every `text-stroke` element. If the font licence or the files make that impossible, fall back to an SVG path version of the name. Verify with a zoomed screenshot of the K and the v.
- [x] **P1-2 Kencho slide (§2.2).** Make every gallery slide use the same frame treatment (match Shemoqmedi: no grey panel, no heavy inner shadow). Fix this in the slide data or component, not with a one-off override.
- [x] **P1-3 Contrast (§2.4).** Raise the resting colour of inactive skill words, slashes and footers to at least 3:1 against the panel background (at least 4.5:1 for small text like "09 tools"). Keep the hierarchy, so the highlighted word still pops. Check all three panels at rest, while hovering and at the end of transitions.
- [x] **P1-4 Hero label (§2.7).** Stop the awkward wrap: use `white-space: nowrap` where it fits, or rebalance the line. Apply D2.
- [ ] **P1-5 Skills as evidence (§2.5, needs D9).** Keep all three panels and their animation. Trim each list to tools that appear in at least one case study. Give each tool a quiet project reference on hover or focus (e.g. "GLSL · Kencho Room", "MCP · Kalami, Shemoqmedi studio") from a `usedIn` field in the content model (Phase 2). Replace the MCP slogan slide with an evidence line, e.g. `MCP — wired into Kalami's classroom tools and Shemoqmedi's studio.` Use the skills subline and footers from Appendix A §4. *(Done except the trim itself, which waits on D9.)*
- [x] **P1-6 Discipline bar (§2.9).** Turn each discipline into a real link to the most relevant case study (Web platforms → Shemoqmedi, 3D experiences → Kencho Room, AI tools → Kalami, 4th item per D1). If a mapping is unclear, leave that item unlinked rather than guessing.
- [x] **P1-7 Carousel title (§2.8).** Check the overlap at every breakpoint. Keep it if it's deliberate and legible; otherwise offset it.
- **Checkpoint:** re-run qa-shots into `qa/phase1/`, compare against the baseline, commit `fix: visual polish from review`.

### Phase 2: Content model (P0)
- [x] Create one typed source of truth, e.g. `src/content/work.ts`, with fields: `slug, index, title, eyebrow, tagline, role, status, year?, stack[], overview, challenge, contributions[{title, body, media?}], engineeringNote, evidence{now, next?}, externalUrl?, previewUrl?, embeddable, media{hero, gallery[], og?}, next`.
- [x] Add `src/content/skills.ts` with a `usedIn: slug[]` field per tool (powers P1-5).
- [x] Add `src/content/profile.ts`: positioning, About copy, lecturer credential (D3), hackathon credential (D4) and availability (D2).
- [x] Fill everything from **Appendix A**, apply D-answers, and use `null` for unknowns. Respect every guardrail in Appendix A §5: 15 students is real and 100+ is only a target; jury members are confirmed vs invited (D7); award status is pending (D6).
- [x] If the site has i18n, add keys instead of hard-coded strings, and don't mix Georgian/English placeholders.
- **Checkpoint:** commit `feat: content model for work, skills, profile`.

### Phase 3: Case-study routes (P0)
- [x] Add `/work/[slug]` (or the equivalent for the router), statically generated for the 4 slugs, with a 404 for anything else.
- [x] Use shared primitives with art direction per project (see Appendix A §3 and §7):
  slim header `GK / WORK / 0X—04 · All work · Menu` → large hero → `At a glance` strip (Role / Type / Stage / Year / Stack, each shown only if known) → Overview → Challenge → What I built (paired with real media) → Engineering notes → Status/evidence → `Visit project` and `Next project` → mini contact strip.
- [x] Give each project its own feel: **Shemoqmedi** editorial/community, **Kencho Room** atmospheric and media-led, **Kencho Group** client and brand story paired visually with Kencho Room ("two deliverables, one client"), **Kalami** UI screenshots, a role diagram and a feature grid.
- [x] **Real media:** use existing assets first. If missing, capture real screenshots of the live projects with Playwright (desktop 1440×900 @2x, mobile 390×844 @3x) and save them as optimised AVIF/WebP with explicit width and height. **Kalami: use only the D8 demo account. Never capture real student names, grades, emails or records.** No stock imagery.
- [x] Reading measure 60–75ch, body text never on busy imagery, generous whitespace, existing tokens only.
- [x] Make the next-project transition feel native to the current motion system.
- [x] Add per-page metadata: unique title, description, canonical URL and an OG image (generated with the framework's OG tooling if available, in the site's own type and colours).
- **Checkpoint:** direct-load and refresh each route, run qa-shots on all 4 routes at all widths, commit `feat: case study pages`.

### Phase 4: Gallery entry points and accessibility (P0/P1)
- [x] Each slide gets visible, distinct actions: `Read case study` (internal route), `Explore live preview` (on-demand embed, only if `embeddable`) and `Visit live ↗` (new tab, `rel="noopener noreferrer"`). They must never trigger the same thing by accident, and dragging must never fire a click (use a movement threshold).
- [x] Add a visible index (`01 / 04`) plus previous/next **buttons**. Keep drag and swipe. When the gallery has focus, ←/→ move it. Add `aria-roledescription="carousel"`, a labelled region and a live region announcing the current slide.
- [x] Live preview modal: mount the iframe only on click, show a loading state, and after a timeout of about 8 s show a fallback with `Open in new tab`. Give the iframe a descriptive `title`, a `sandbox` with the minimum permissions needed, and `loading="lazy"`. Escape closes it, focus is trapped while open and restored on close, and background scroll (Lenis) stops while it's open.
- [x] Never mount several external apps on page load.
- [x] Back/forward and returning from a case study restore the active slide (via the URL `?work=slug` or sessionStorage) and the scroll position.
- **Checkpoint:** keyboard-only walkthrough (Tab, Enter, Space, Esc, arrows) documented in the report, commit `feat(a11y): gallery entry points`.

### Phase 5: About, credentials and recruiter path (P0)
- [x] Add the About passage (Appendix A §4) in an existing surface (menu overlay or a light section), without breaking the home rhythm. Include the lecturer credential (D3) and the hackathon/GITEX AI credential (D4) as restrained micro-labels, not corporate cards.
- [ ] Photo frames: add the real one-line captions from D12, e.g. the Berlin frame becomes evidence for D4. Bery stays as the comic beat. *(Waits on D12.)*
- [x] Contact overlay: add the intro paragraph (fixes §2.6), plus three clear actions: `Email me` / `Download CV` / `Explore work`. Don't overwrite any existing contact detail.
- [x] Recruiter path: put a persistent, low-key `CV` and `Email` within one action from every page (e.g. in the menu header and the case-study header). Check that both CVs (EN and Georgian) download with correct filenames and MIME types.
- [x] Footer: make sure `Back to top`, the copyright and an obvious way to open Contact are all present.
- **Checkpoint:** commit `feat: about, credentials, recruiter path`.

### Phase 6: Motion, performance and reduced motion (P1)
- [x] `prefers-reduced-motion: reduce`:
  - disable Lenis smooth scroll and scroll-jacking/pinning
  - replace camera moves and parallax with fades or static states
  - stop continuously moving type
  - the GIORGI photo reveal becomes a static final state
  
  Every bit of content must stay reachable.
- [x] Three/R3F hygiene:
  - pause rendering when the canvas is off-screen (IntersectionObserver → `frameloop="demand"` or stop the RAF)
  - dispose geometries, materials and textures on unmount and on route change
  - avoid a second WebGL context when navigating to a case study and back
  - check memory stays flat after 5 round trips
- [x] Lazy-load media below the fold, reserve dimensions (CLS ≈ 0), dynamically import heavy modules, and keep the grain a static tiled texture (not an animated full-screen canvas) unless it's already cheap.
- [x] Measure with a clean profile, 3 runs each for home and one case study, mobile and desktop. Record LCP, CLS, INP/TBT and Lighthouse ranges in the report. Don't chase 100 at the cost of the experience.
- **Checkpoint:** commit `perf: motion and webgl hygiene`.

### Phase 7: Responsive and accessibility QA (P1)
- [ ] Run qa-shots into `qa/final/` for every home section and all 4 case studies at all 7 widths, with motion on and off. **Review every image** and fix clipping, horizontal overflow, collisions, unreadable text and touch-target size (at least 44 px). *(Started, stopped by the owner as too slow; replaced by spot checks. See FINISH_REPORT.md.)*
- [x] Add `@axe-core/playwright` checks on home, the menu overlay, the contact overlay and each case study. Fix all serious and critical issues.
- [ ] Check visible focus rings everywhere (in the orange token, at least 3:1 against their background), a tab order that matches the visual order, landmarks, a single h1 per page, alt text, and `lang` attributes. *(Partly: axe, landmarks, h1 and lang checked; a full keyboard walk was not redone after the last changes.)*
- [x] Check every link: internal, external projects, mailto, tel, GitHub, LinkedIn, both CVs and the language links.
- [x] Zero console errors, hydration warnings or missing-key warnings.
- **Checkpoint:** commit `a11y: responsive and accessibility QA`.

### Phase 8: Metadata, SEO and submission kit (P2)
- [x] Sitemap, robots, canonical URLs, favicon set, OG images for home and each project, and structured data (`Person` + `CreativeWork` per project, only with verified fields).
- [x] Create `docs/SUBMISSION_KIT.md` (no submitting): a one-paragraph site description, the tech list, credits, 3–4 hero stills at 1600×1200 and a list of best-moment clips to record. Mark it ready only after Phases 1–7 pass.

### Phase 9: Final report (in chat and in `docs/FINISH_REPORT.md`)
- [x] Changed files and why, grouped by phase.
- [x] P0/P1/P2 status, with the §2 findings marked fixed or not fixed.
- [x] Lint, typecheck, build and test results stated truthfully, plus the performance ranges.
- [x] Every remaining `TODO(owner)` and D-item still open.
- [x] Never call the site live unless a deployment was actually done and verified (and only as a preview, per D13).

---

## 4. Definition of done
1. Within 10–15 seconds, a recruiter understands who Giorgi is: creative full-stack developer, product builder and university lecturer.
2. Every gallery item has a keyboard-accessible route to an accurate case study, and the preview and case-study actions are distinct.
3. Kencho Room and Kencho Group are clearly two deliverables for one client.
4. Shemoqmedi has no "first" or "leading" claims and no premature results. Kalami is a **15-student pilot** with a **100+ target**.
5. The credentials (lecturer, hackathon) are visible, verified and not exaggerated.
6. CVs, email, GitHub, LinkedIn and project links all work.
7. All §2 visual findings are fixed: outline glitch, slide consistency, contrast, tool wall, contact gap and label wrap.
8. Mobile at 320 px, keyboard-only use and reduced motion all work fully.
9. The identity is intact: hero, curved gallery, skills panels, photos, Bery, the GIORGI finale and the grain.
10. Lint, typecheck and build pass, or the blockers are documented.

---

## 5. Prompt to paste into Claude Code

> Act as a senior creative frontend engineer and portfolio art director. The implementation spec is `docs/PORTFOLIO_PLAN.md` in this repo. Read the whole file first, including Section 0 (owner decisions) and Appendix A (approved copy). Work through Phases 0–9 **in order**, ticking checkboxes in the file as you complete them and committing at the end of every phase on branch `feat/portfolio-finish`. Preserve the existing identity listed in Section 1. Never invent claims, numbers, URLs or awards. Unanswered owner decisions become `TODO(owner)` and you keep going on everything that isn't blocked. Use Playwright screenshots to actually look at your work at every checkpoint, and don't claim visual checks you didn't do. Don't install UI frameworks, don't replace GSAP/Lenis/Three, and don't deploy to production. If the context resets, re-read the plan and resume from the first unticked box. Finish with the Phase 9 report.

---

# APPENDIX A: Approved copy deck and visual requirements (from ChatGPT brief v1.0)
*Use this copy as the starting draft. Where it conflicts with the sections above, the sections above win (e.g. P1-5 replaces the MCP slogan, and the D-answers override any VERIFY items).*

## 4. Exact homepage copy

### Hero microcopy — retain visual structure
**Primary name:** Giorgi Khvichia.

**One-line professional descriptor (insert as restrained metadata in available grid whitespace):**  
`CREATIVE FULL-STACK DEVELOPER / WEB EXPERIENCES / EDUCATION`

**Alternate, more human descriptor for About preview:**  
`I build expressive interfaces and the systems behind them.`

**Availability (replace the current ambiguous “Available for select work — 2026/27” only if the owner confirms job-search availability):**  
`OPEN TO REMOTE FRONTEND ROLES & SELECT COLLABORATIONS`

**Discipline labels:**
- `01 / Web platforms`
- `02 / 3D experiences`
- `03 / AI tools`
- `04 / Learning systems`

The fourth label in current screenshot says `Hardware`. **VERIFY** whether hardware is an important real part of the owner's work. If yes, keep it. If not, `Learning systems` more accurately represents Kalami and the showcased work. Don't silently replace without reviewing that part of the portfolio.

### Concise About paragraph (home/menu)
> I'm a creative full-stack developer based in Tbilisi, Georgia. I design and build interactive websites, web applications, and the systems that make them work. From an immersive furniture showroom to a platform for Georgian digital creators and tools used in real classrooms, I enjoy taking ideas from the first sketch to a working product. I also teach web development fundamentals at university — which keeps me close to both the craft and the people learning it.

### Alternate shorter About summary
> Full-stack developer, creative engineer, and university lecturer. I build fast, visually distinctive web experiences and complete products — from concept to deployment.

### 3 proof-oriented micro-lines for near About or work index (optional; avoid overcrowding hero)
- `INDEPENDENTLY BUILT / END TO END`
- `LIVE CLIENT WORK & ACTIVE PRODUCT PILOTS`
- `DESIGN, ENGINEERING & EDUCATION`

Do not invent years of experience; if the actual CV contains verified dates, those may be added.

### Skills intro (replace generic MCP slogan only if it improves story)
Heading stays `Skills.`
Subline: `The interface, the engine, and everything connecting them.`

The existing three accordions stay the same. Their contents should reflect tools the owner has **actually used**. Existing screenshot lists Interface: Next.js, React, Tailwind CSS, GSAP, Lenis, Three.js, React Three Fiber, Vite, Vercel. Engine: Convex, ImageKit, Cloudflare, TypeScript, JavaScript, Python, GLSL, Node.js, Playwright. Around it: Clerk, Resend, PWA, Web Push, MCP, Figma, Blender, Git. Keep verified items; if updating, add SQL/MySQL discreetly in Engine only with owner's approval. Avoid increasing the visual density unnecessarily.

Suggested short footers for each skills category:
- **Interface:** `Where motion, clarity, and performance meet.`
- **Engine:** `The systems behind the experience.`
- **Around it:** `The tools that connect the product to real life.`

### Contact overlay enhancement
Retain giant orange-outline `Giorgi Khvichia` and the existing working email, phone, GitHub, LinkedIn, Shemoqmedi studio link, CV download, and Georgian CV. **Don't invent or overwrite contact details.**

Add modest text above the links:
> Have an ambitious interface, a product to launch, or a team that needs a developer who understands both design and engineering? I'd love to hear about it.

Optional clear actions: `Email me` / `Download CV` / `Explore work`. Avoid creating extra fake email forms.

### Final footer
Keep the animated giant **GIORGI** letter/photo effect and **Bery**. No need to make this traditional. Ensure a visible `Back to top`, copyright, and clear way to open `Contact`.

---

## 5. Exact project-card and case-study copy

### 5A. SHEMOQMEDI.SPACE — Georgian digital creativity / web-awards platform

**Gallery eyebrow:** `01 / PLATFORM · COMMUNITY · AWARDS`

**Gallery one-liner:** `A home for Georgia's digital creators and the work worth recognizing.`

**Gallery role/status:** `Founder · Product design · Full-stack engineering` / `Active development & community building`

**Hero title:** `SHEMOQMEDI`  
**Hero subtitle:** `Recognizing the people shaping Georgia's digital web.`

**Overview:**
> Shemoqmedi is an independent platform I'm building to give Georgia's web designers, developers, and digital creators a place to share their work and earn meaningful recognition. I conceived the product, designed the experience, and engineered the application from the ground up, with support from my brother. The public platform brings together project discovery, creative showcases, and a developing awards community. Alongside it, I've built internal tools that help us operate and grow the platform without turning every content task into manual work.

**The challenge:**
> A credible creative community needs more than a gallery. It needs an experience people want to browse, a clear way for creators to participate, and judging processes that can earn trust. The challenge is to build the product and the community at the same time.

**What I built (only publish features verified in live code):**
- `Discovery & showcases` — browsing experiences, categories, and featured digital work.
- `Creator participation` — visible project submission and creator-facing surfaces.
- `Awards foundation` — workflows and UI for a growing jury-driven community. Do not claim completed judging or active automated scores unless verified.
- `Internal production studio` — MCP-connected, AI-assisted content and media workflows used for platform operations. This is internal, not a public customer feature.
- `Full-stack implementation` — frontend, backend integrations, data and user-facing flows.

**Engineering note:**
> I treated Shemoqmedi as both a public-facing creative experience and an operational product. The interface needs to feel distinctive, while the underlying workflows need to support submissions, content, people, and future growth.

**Status / proof:**
> **Now:** The product is being developed and the community and jury are being assembled. One jury member has already joined; additional professionals have been approached. **Next:** Build sustained submissions and judging activity, establish transparent evaluation standards, and grow participation.

**Important guardrail:** Do **not** write `Georgia's first`, `Georgia's leading`, `award-winning`, `thousands of creators`, or similar claims without independent support. Do not call pending jury invitations confirmed memberships.

**CTA labels:** `Explore Shemoqmedi` / `Visit live platform` / `Next: Kencho Room`

**Suggested visuals:** Hero website screenshot; directory browse/categories; submit/create workflow; one diagram/illustration of public platform + internal studio (do not show private keys or admin details).

---

### 5B. KENCHO ROOM — interactive furniture showroom

**Gallery eyebrow:** `02 / CREATIVE DEVELOPMENT · IMMERSIVE WEB`

**Gallery one-liner:** `A furniture showroom designed to be explored, not just scrolled.`

**Role/status:** `Creative developer · Interactive engineering` / `Client project · Delivered`

**Hero title:** `KENCHO ROOM`  
**Hero subtitle:** `An interactive room for a custom-furniture brand.`

**Overview:**
> Kencho Room is an immersive digital showroom created for Kencho Group, a custom-furniture business. Instead of presenting furniture through an ordinary sequence of static sections, I built an interactive environment that invites visitors to explore the brand more spatially. I developed the experience from scratch, bringing together art direction, motion, interactive presentation, and the underlying frontend implementation.

**The challenge:**
> Furniture is physical, tactile, and spatial. The challenge was to translate that feeling into a browser experience while keeping the interface usable and performant.

**What I built:**
- `Spatial presentation` — an immersive environment and exploratory navigation.
- `Motion & interaction` — transitions and visual treatments supporting the showroom's atmosphere.
- `Brand expression` — digital art direction that connects to Kencho's furniture identity.
- `Responsive implementation` — document specific mobile behavior after verification; don't claim mobile parity before QA.

**Engineering note:**
> The project demanded a careful balance between visual ambition and practical browser performance. I wanted the interface to feel unusual without making it difficult to use.

**Status / proof:**
> **Now:** A delivered client experience. The project has been submitted for design-award review; any decision is pending.

**Important guardrail:** If the award submission state has changed, update this copy. Never imply a win or nomination unless confirmed.

**CTA labels:** `Enter the showroom` / `See the case study` / `Next: Kencho Group`

**Suggested visuals:** Distinctive room start screen; spatial transitions; close-ups of interaction details; mobile version; optional 10–20-second muted video for the most important motion.

---

### 5C. KENCHO GROUP — main brand website

**Gallery eyebrow:** `03 / CLIENT WORK · WEB EXPERIENCE`

**Gallery one-liner:** `A digital home for a custom-furniture studio.`

**Role/status:** `Full-stack / frontend implementation · End-to-end delivery` / `Client project · Delivered`

**Hero title:** `KENCHO GROUP`  
**Hero subtitle:** `Giving a custom-furniture business a distinctive digital presence.`

**Overview:**
> Alongside the interactive Kencho Room, I built Kencho Group's main website from the ground up. Where the showroom focuses on an exploratory brand experience, the main website gives the business a clear public presence and a place to present its identity and work. I handled the implementation end to end, aiming for a visual language that felt appropriate for a contemporary custom-furniture company.

**The challenge:**
> The website needed to communicate the brand clearly while complementing — rather than duplicating — the more experimental showroom experience.

**What I built:**
- `Main brand experience` — visual structure, page layouts, and identity expression.
- `Project / product presentation` — clarify the exact public sections once checked in the codebase.
- `Responsive frontend` — describe confirmed responsive and mobile behavior.
- `Full implementation` — production website, supporting interactions, and relevant integrations as verified.

**Engineering note:**
> The interesting part of this engagement was creating two connected experiences with different jobs: one for clarity and business presence, and one for immersion and exploration.

**Status / proof:**
> **Now:** Delivered client website. Pair this case study with Kencho Room as a two-part engagement, keeping each experience independently explorable.

**CTA labels:** `Visit Kencho Group` / `Explore Kencho Room` / `Next: Kalami`

**Suggested visuals:** Main homepage, brand/detail section, project/work presentation, mobile screen, and visual side-by-side linking brand site to showroom.

---

### 5D. KALAMI.SPACE — AI-integrated learning platform

**Gallery eyebrow:** `04 / EDTECH · PRODUCT ENGINEERING · EDUCATION`

**Gallery one-liner:** `Built in the classroom. Tested by the people learning in it.`

**Role/status:** `Creator · Full-stack engineer · University lecturer` / `Active university pilot`

**Hero title:** `KALAMI`  
**Hero subtitle:** `An educational platform shaped by real classroom needs.`

**Overview:**
> Kalami is a learning platform I created while teaching web development fundamentals at university. It gives lecturers and students a shared environment for learning materials, assessments, interactive lessons, and hands-on coding. I designed and built the application from scratch, including role-based areas for students, lecturers, and administrators, MCP-connected tools for AI-assisted workflows, and a built-in HTML/CSS editor. The aim is not simply to digitize a classroom, but to make everyday teaching and learning easier to manage.

**The challenge:**
> Teaching web development involves explaining concepts, sharing content, managing assessments, and helping students practice in code. I wanted these activities to live in one connected environment rather than be scattered across unrelated tools.

**What I built:**
- `Students` — access to learning resources and MCP-enabled AI assistance within the available material.
- `Lecturers` — workflows for course materials, exams, assessments, and shareable visual presentations.
- `Administration` — distinct lecturer and super-admin roles with corresponding access.
- `Hands-on coding` — an integrated HTML/CSS editor for classroom exercises.
- `Communication` — PWA support, web push notifications, and automated email flows.

**Engineering note:**
> Kalami combines an interface for everyday classroom use with role-based product architecture, content workflows, and AI integrations. A key requirement was letting students work in an embedded coding environment while the lecturer could run and observe the lesson.

**Status / proof:**
> **Now:** Active early pilot. A first classroom exercise involved 15 students working at the same time, and the system performed well during that test. **Next semester target:** Expand to three additional lecturers and a total student base exceeding 100, subject to rollout plans and institutional agreement. **Longer-term ambition:** Faculty adoption, then wider university deployment and potential commercialization.

**Important guardrail:** `15 students tested` is real; `100+ students` is a **target**, not an achieved metric. Do not imply load testing at thousands of concurrent users, institutional purchase agreements, AI grading, or university-wide adoption.

**CTA labels:** `Explore Kalami` / `View the platform` / `Back to selected work`

**Suggested visuals:** Student dashboard, lecturer controls, embedded coding editor, generated presentation view, PWA on a phone, and a simple role diagram. Blur private student names, grades, emails, and course records before publishing.

---

## 6. Optional professional profile / CV-facing short copy

**Headline for application:**  
`Creative Full-Stack Developer | React, Next.js & Interactive Web Experiences`

**Short recruiter intro:**
> I build fast, accessible React/Next.js experiences and complete web products. My work includes an immersive furniture showroom, a Georgian creative-platform startup, and an education application currently being piloted in a university classroom. I handle projects from concept to implementation, and I also teach web development fundamentals.

**Optional longer About section:**
> I'm a full-stack developer and creative engineer based in Tbilisi, Georgia. I enjoy projects that require both strong visual thinking and the technical depth to make an experience actually work. My portfolio spans interactive showrooms, client websites, community platforms, and educational tools. I'm building Shemoqmedi, developing Kalami alongside my teaching work, and collaborating with clients to deliver distinctive web experiences. I work across interface design, application architecture, and the systems connecting them. For me, a great website should feel memorable, work reliably, and make sense to the people using it.

**Teaching credential card** (VERIFY actual university name, appointment title, and start date before adding them):  
`UNIVERSITY LECTURER`  
`Teaching web development fundamentals. Building classroom tools informed by direct student feedback.`

Do not claim a senior job title, leadership of teams, enterprise scale, formal credentials, or years of employment not evidenced by the owner.

---

## 7. Visual and interaction implementation requirements

### Work gallery
- Keep the 3D curved carousel and its cinematic transitions.
- Add clear `01 / 04` indexing and an obvious `VIEW CASE STUDY` action that doesn't rely on discovering an obscure hover target.
- Make the preview and the case-study links distinguishable. `Explore preview` and `Read story` must not open the same thing accidentally.
- Ensure mouse, touch, keyboard, and screen-reader alternatives. Implement real buttons, not clickable divs. Left/right keys may move the gallery when the gallery has focus.
- If live iframe previews are used: load only on demand, show a progress state and a helpful failure/timeout fallback with `Open in new tab`; include an informative iframe title and restrict capabilities appropriately; do not mount four full external applications immediately on page load.
- Keep navigation state consistent on back/forward and when returning from a case study. Do not unexpectedly reset the user's progress unless the existing behavior intentionally requires it.

### Project pages
- Reuse current spacing/grid/color/typography tokens. Introduce a project-page wrapper with clear content rhythm: large visual, short editorial blocks, screenshot details, and explicit links.
- Prefer 60–75-character reading lines for paragraphs. Keep hero headings bold and short. Avoid body text over dense backgrounds.
- Custom hero treatment per project; shared layout primitives, unique imagery.
- Keep generous whitespace; don't compress everything into generic rectangular cards.
- Use images/video already present in the project/assets when possible. Don't invent screenshots or use unrelated stock imagery.
- Add a next-project navigation moment that feels native to the existing motion system.

### About, contact, CV
- Integrate university lecturer role naturally; it is a meaningful professional credential.
- Existing personal photography/honey badger should stay. Don't make them into a corporate headshot section.
- Verify current CV downloads and all contact links. Make primary email and CV reachable from any page, without requiring excessive navigation.
- Consider a restrained `Available for remote frontend opportunities` indicator if confirmed by the owner; do not misrepresent availability.

---
