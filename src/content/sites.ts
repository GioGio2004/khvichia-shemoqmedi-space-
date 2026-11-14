import kalamiLong from '../assets/sites/kalami-long.webp'
import kalami from '../assets/sites/kalami.webp'
import kenchoLong from '../assets/sites/kencho-long.webp'
import kenchoRoomLong from '../assets/sites/kencho-room-long.webp'
import kenchoRoom from '../assets/sites/kencho-room.webp'
import kencho from '../assets/sites/kencho.webp'
import shemoqmediLong from '../assets/sites/shemoqmedi-long.webp'
import shemoqmedi from '../assets/sites/shemoqmedi.webp'

/**
 * The websites he has built, in order. Two parts of the page show them: the
 * list in "The road so far" and the curved slider in the work section.
 *
 *   name    the large title above the slider
 *   domain  what the list shows
 *   url     what opens when a card or panel is opened
 *   kind    a few words about it (drafts)
 *   shot    a picture of the site's first screen
 *   long    a picture of the whole page, shown instead of the live site when
 *           the site cannot be shown live
 *   live    whether the site lets this page show it inside a frame.
 *           shemoqmedi.space allows it only from this site's real addresses
 *           (see FRAME_ANCESTORS in its next.config.ts), so it is live once
 *           the site is deployed and a picture while working on it locally.
 *           kalami.space allows it only from khvichia.shemoqmedi.space, so
 *           it is live there and a picture anywhere else (the Vercel
 *           address, or while working on the site locally).
 *
 * The pictures were taken with a headless browser at 1440 x 900.
 */
/** True when this page is open at its real address, the only one kalami.space lets itself be framed by. */
const atHome = typeof window !== 'undefined' && window.location.hostname === 'khvichia.shemoqmedi.space'

export type Site = { slug: string; name: string; domain: string; url: string; kind: string; shot: string; long: string; live: boolean }

export const sites: Site[] = [
  {
    slug: 'shemoqmedi',
    name: 'shemoqmedi',
    domain: 'shemoqmedi.space',
    url: 'https://www.shemoqmedi.space/',
    kind: 'Web design awards',
    shot: shemoqmedi,
    long: shemoqmediLong,
    live: !import.meta.env.DEV,
  },
  {
    slug: 'kencho-room',
    name: 'Kencho Room',
    domain: 'room.kenchogroup.ge',
    url: 'https://room.kenchogroup.ge/',
    kind: '3D furniture room',
    shot: kenchoRoom,
    long: kenchoRoomLong,
    live: true,
  },
  {
    slug: 'kencho',
    name: 'Kencho',
    domain: 'kenchogroup.ge',
    url: 'https://www.kenchogroup.ge/',
    kind: 'Custom furniture studio',
    shot: kencho,
    long: kenchoLong,
    live: true,
  },
  {
    slug: 'kalami',
    name: 'Kalami',
    domain: 'kalami.space',
    url: 'https://www.kalami.space/',
    kind: 'Learning platform',
    shot: kalami,
    long: kalamiLong,
    live: atHome,
  },
]
