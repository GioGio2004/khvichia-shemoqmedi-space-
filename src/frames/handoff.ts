/**
 * How the side scroll hands its photos to the footer. When the side scroll
 * ends, the footer draws the same photos exactly where they are on screen
 * and moves them into the word, so it has to know where they are. It reads
 * that straight from the page.
 *
 * A place is in screen pixels, measured as if the side scroll's stage were
 * still held at the top of the screen: the photo's middle, its size, and how
 * much it is dimmed (1 = not at all).
 */
export type Place = { x: number; y: number; width: number; height: number; dim: number }

/** One place per photo of the side scroll, in order, or null if the side scroll is not on the page. */
export function photoPlaces(): Place[] | null {
  const stage = document.querySelector<HTMLElement>('.frames-stage')
  const frame = stage?.querySelector('.frames-frame')
  if (!stage || !frame) return null
  const held = stage.getBoundingClientRect()
  // The photo whose turn it is hangs in the frame, at the frame's size; the rest are the small photos of the row.
  const shown = Number(stage.style.getPropertyValue('--index') || 0)
  return [...stage.querySelectorAll('.frames-row li')].map((item, i) => {
    const large = i === shown
    const box = (large ? frame : item).getBoundingClientRect()
    return {
      x: box.left + box.width / 2 - held.left,
      y: box.top + box.height / 2 - held.top,
      width: box.width,
      height: box.height,
      dim: large ? 1 : 0.86,
    }
  })
}
