# khvichia.shemoqmedi.space

Giorgi Khvichia's portfolio. Vite + React + TypeScript, fully static, no
backend. One page, top to bottom:

| Part | What it is | Code |
| --- | --- | --- |
| Opening | The name, the silhouette on its orange block, the charcoal strip | `src/hero/` |
| Skills and stack | Four full-screen cards that lap over each other like terraces: "Skills", then three walls of tool names | `src/about/` |
| Work | A row of bent screens, one per site; the middle one opens into the live site | `src/work/` |
| A few frames | A side scroll through photos, each with its comment | `src/frames/` |
| Ending | The photos leave their row and become the letters of GIORGI | `src/footer/` |
| Menu | The tab in the top right corner; "Contact" brings it down over the whole screen with the links and the CV button | `src/components/Menu.tsx` |

The styles every page shares (tokens, the monogram, the menu and its sheets) are in `src/base.css`; the home
page's own are in `src/home.css`, and the case studies' in `src/case/case.css`.

## Change the words and pictures

Everything the page says is in `src/content/`:

- `hero.ts`: the opening screen
- `skills.ts`, `stack.ts`: the skills card and the three walls of tools
- `sites.ts`: the sites in the work row
- `road.ts`: the photos of the side scroll, their order and comments
- `contact.ts`: email, phone, LinkedIn, GitHub, shemoqmedi.space, and the CV files
- `sections.ts`: what the menu lists

## Commands

```bash
npm run dev      # the site at http://localhost:5173
npm run build    # type check and build into dist/
npm run lint     # oxlint
npm run road     # remake the photos after adding or replacing one in photos/road/
npm run cv       # remake the CV PDFs in public/cv/ (words in scripts/cv-content.mjs)
```

`npm run cv` prints the PDFs with the Edge (or Chrome) installed on the
machine, so it runs on Windows without anything extra.

## Deploying

The site is static: `npm run build` writes everything to `dist/`. On Vercel
the project builds itself on every push to `main`.

## Why it loads fast

- The build writes the finished page into `index.html`, with its styles
  inside (`scripts/prerender.mjs`, drawing `src/entry-server.tsx`). The first
  paint needs that one file and no script; the script then takes the page
  over. Anything `src/main.tsx` draws, `src/entry-server.tsx` must draw too.
- The page's script is fetched only after the page has loaded, or at once on
  the first press, tap, scroll or key (`loadScriptsLater` in
  `scripts/prerender.mjs`). The opening is drawn by the stylesheet alone, and
  every part of the page is visible without the script.
- React takes the built page over one part at a time (each section and each
  skill card is its own `Suspense` boundary in `src/App.tsx` and
  `src/about/Stack.tsx`), so no single task blocks the browser for long.
- Smooth scrolling (Lenis) starts on the first wheel, touch, press or key
  (`src/lib/scroll.ts`); the outline font is fetched a little after load
  (`src/lib/later.ts`). The closed menu sheets are not laid
  out until the menu is first opened (`data-woken` in `src/components/Menu.tsx`).
- Every animation moves only position, size or opacity, so the graphics card
  draws it; nothing repaints the page frame after frame.
- The heavy parts get ready one after another, never at page load: the 3D
  gallery on the visitor's first mouse movement, scroll or touch
  (`src/work/Work.tsx`; a skeleton of its panels stands in until it can draw),
  then the photos of the side scroll and the footer's letters
  (`src/lib/ready.ts`). Each also starts on its own when the visitor gets
  near it.
- `public/` holds `robots.txt`, `sitemap.xml` and `llms.txt`. There is no
  catch-all rewrite: an address that does not exist is a real 404.
