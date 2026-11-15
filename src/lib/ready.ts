/**
 * The order the heavy parts of the home page get ready in. The 3D gallery
 * goes first (it starts on the visitor's first scroll or touch, see
 * Work.tsx); the photos of the side scroll and the footer's letters wait for
 * it here and start right after, so the three never fight over the same
 * moment. Each of them also starts on its own when the visitor gets near it,
 * whatever the gallery is doing.
 */
let ready = false
const waiting = new Set<() => void>()

/** The gallery is ready (or will never be, when the browser cannot draw it): the next parts may start. */
export function markGalleryReady() {
  if (ready) return
  ready = true
  waiting.forEach((start) => start())
  waiting.clear()
}

/** Calls `start` once the gallery is ready, at once if it already is. Returns a way to stop waiting. */
export function afterGallery(start: () => void) {
  if (ready) {
    start()
    return () => {}
  }
  waiting.add(start)
  return () => {
    waiting.delete(start)
  }
}
