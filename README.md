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

All the styles are in `src/styles.css`.

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
