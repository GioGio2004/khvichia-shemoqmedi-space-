import kalamiLong from '../assets/sites/kalami-long.webp'
import kalami from '../assets/sites/kalami.webp'
import kenchoLong from '../assets/sites/kencho-long.webp'
import kenchoRoomLong from '../assets/sites/kencho-room-long.webp'
// The room itself, not the START screen in front of it.
import kenchoRoom from '../assets/sites/kencho-room.webp'
import kencho from '../assets/sites/kencho.webp'
import shemoqmediLong from '../assets/sites/shemoqmedi-long.webp'
import shemoqmedi from '../assets/sites/shemoqmedi.webp'

/**
 * The websites he has built, in order: their addresses and the pictures the
 * curved slider in the work section shows. Their story (what each one is, his
 * role, the case study) is in work.ts and cases.ts, which use these by slug.
 *
 *   name    the large title above the slider
 *   domain  what the list shows
 *   url     what opens when a card or panel is opened
 *   kind    a few words about it (drafts)
 *   shot    a picture of the site's first screen
 *   long    a picture of the whole page, shown instead of the live site when
 *           the site cannot be shown live, with the size of its file (so
 *           the window keeps its room while it loads)
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

export type Site = {
  slug: string
  name: string
  domain: string
  url: string
  kind: string
  shot: string
  long: { src: string; width: number; height: number }
  live: boolean
}

export const sites: Site[] = [
  {
    slug: 'shemoqmedi',
    name: 'shemoqmedi',
    domain: 'shemoqmedi.space',
    url: 'https://www.shemoqmedi.space/',
    kind: 'Web design awards',
    shot: shemoqmedi,
    long: { src: shemoqmediLong, width: 1440, height: 5200 },
    live: !import.meta.env.DEV,
  },
  {
    slug: 'kencho-room',
    name: 'Kencho Room',
    domain: 'room.kenchogroup.ge',
    url: 'https://room.kenchogroup.ge/',
    kind: '3D furniture room',
    shot: kenchoRoom,
    long: { src: kenchoRoomLong, width: 1440, height: 900 },
    live: true,
  },
  {
    slug: 'kencho-group',
    name: 'Kencho Group',
    domain: 'kenchogroup.ge',
    url: 'https://www.kenchogroup.ge/',
    kind: 'Custom furniture studio',
    shot: kencho,
    long: { src: kenchoLong, width: 1440, height: 5200 },
    live: true,
  },
  {
    slug: 'kalami',
    name: 'Kalami',
    domain: 'kalami.space',
    url: 'https://www.kalami.space/',
    kind: 'Learning platform',
    shot: kalami,
    long: { src: kalamiLong, width: 1440, height: 5200 },
    live: atHome,
  },
]
