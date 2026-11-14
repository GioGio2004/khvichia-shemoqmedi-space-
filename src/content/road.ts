import bery from '../assets/road/bery-colour.webp'
import caps from '../assets/road/caps-colour.webp'
import coffee from '../assets/road/coffee-colour.webp'
import entrance from '../assets/road/gitex-entrance-colour.webp'
import showFloor from '../assets/road/gitex-show-floor-colour.webp'
import graduation from '../assets/road/graduation-colour.webp'
import street from '../assets/road/tbilisi-friends-colour.webp'

/**
 * The photos of the side scroll, in the order they pass through the frame.
 * The last six then leave the row and become the letters of `footerWord`.
 *
 * Every photo has a comment that comes up while it is in the frame; the
 * comments take turns on the left and the right of the frame.
 *
 *   note    the comment
 *   link    makes the comment a link (opens in a new tab)
 *   focus   the point of the photo that stays in view when it is cropped:
 *           [0, 0] is the photo's top left corner, [1, 1] its bottom right
 *   stay    extra scrolling (in screen heights) spent on the photo before
 *           the next one comes
 *   cameo   for the guest: instead of a plain comment, a tag, a small first
 *           line, a small second line a beat later, and then the name very
 *           large (one entry per line; the full stop is added in orange)
 *
 * The photos come from photos/road/ (run `npm run road` after adding or
 * replacing one).
 */
export type Frame = {
  slug: string
  colour: string
  focus: [number, number]
  note?: string
  link?: string
  stay?: number
  cameo?: { tag: string; lead: string; bridge: string; name: string[] }
}

export const road: Frame[] = [
  { slug: 'street', colour: street, focus: [0.42, 0.42], note: 'Me and my friends in the street.' },
  { slug: 'caps', colour: caps, focus: [0.46, 0.42], note: 'GTU graduation.' },
  { slug: 'graduation', colour: graduation, focus: [0.52, 0.41], note: 'Same thing.' },
  {
    slug: 'bery',
    colour: bery,
    focus: [0.5, 0.36],
    stay: 0.9,
    cameo: {
      tag: 'Unexpected cameo',
      lead: 'You might be wondering what a honey badger is doing here.',
      bridge: 'It’s simple — because it’s',
      name: ['Bery the', 'honey badger'],
    },
  },
  { slug: 'coffee', colour: coffee, focus: [0.68, 0.46], note: 'Coffee.' },
  {
    slug: 'show-floor',
    colour: showFloor,
    focus: [0.42, 0.47],
    note: 'Me and the Torq guy.',
    link: 'https://www.linkedin.com/feed/update/urn:li:activity:7478020126835937281/',
  },
  { slug: 'gitex-entrance', colour: entrance, focus: [0.5, 0.62], note: 'GITEX AI Europe.' },
]

/** The word the footer builds out of the last photos, one letter each. */
export const footerWord = 'GIORGI'
