# Submission kit

Material for an awards submission (Awwwards, CSS Design Awards, or similar). Nothing has been submitted.

**Status: not ready yet.** The plan says to mark it ready only after Phases 1 to 7 pass. Phases 1 to 6 are done; Phase 7 was cut short (see `docs/FINISH_REPORT.md`), and the site with these changes is not deployed. Deploy, check the live site, then submit.

## Site

- **Title:** Giorgi Khvichia
- **URL:** https://khvichia.shemoqmedi.space
- **Category:** Portfolio
- **Country:** Georgia

## Description (one paragraph)

The portfolio of Giorgi Khvichia, a creative full-stack developer and university lecturer in Tbilisi. A Swiss grid in white, charcoal and one orange opens on his silhouette and name. His tools stack up as full-screen cards like terraces; his projects bend around a curved WebGL gallery, each opening into a live preview or its own case study; a side scroll of photos runs through a dashed frame, with one unexpected guest, Bery the honey badger; and at the end those photos fly into place as the letters of GIORGI, the screen floods orange and the letters fill with black.

## Technologies

React 19, TypeScript, Vite, Three.js, React Three Fiber, GLSL (hand-written shaders for the bent panels and the photo letters), Lenis, CSS custom properties, cross-document View Transitions, server-side prerendering, Vercel.

## Credits

- Design and development: Giorgi Khvichia
- Type: Inter (Rasmus Andersson, SIL OFL), Anton (Vernon Adams, SIL OFL)
- Photography: Giorgi Khvichia and friends. TODO(owner): confirm the honey badger photo's source and licence before submitting.

## Stills (1600 x 1200)

In `docs/submission/`, made by `node scripts/stills.mjs` from the built site:

| File | Shows |
|---|---|
| `01-opening.jpg` | The opening: name, silhouette on the orange block, discipline strip |
| `02-work-gallery.jpg` | The curved work gallery with Shemoqmedi in the middle and its three actions |
| `03-finale.jpg` | The end: GIORGI in black on orange |
| `04-case-kencho-room.jpg` | The Kencho Room case study opening on charcoal |

## Moments worth recording as clips

Record on a real screen (1920 x 1080 or larger), 60 fps, no cursor jitter, about 5 to 10 seconds each:

1. The opening: strip rises, block grows, silhouette rises, the name comes up letter by letter, the full stop bounces.
2. Scrolling through the skills: cards lap over each other, one tool name hovered (each reacts differently).
3. The gallery: dragging the curved row so the panels bend and split, then "Live preview" un-bending a panel into a live site.
4. The side scroll: photos passing through the dashed frame, ending on Bery's cameo.
5. The finale: the photos leaving the row, trimmed into GIORGI, the orange flood and the black fill.
6. A case study: from the gallery's "Read case study" into the page (the view transition), then the next-project band.
7. The menu: Menu opening along the top, About and Contact dropping down as full sheets.
