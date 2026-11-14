import 'lenis/dist/lenis.css'

import Lenis from 'lenis'
import { useEffect } from 'react'

/**
 * Smooth scrolling for a whole page (also for links to a place on the same
 * page). One instance per page, kept here so that anything that opens over
 * the page (the contact sheet, a live preview) can hold the page still.
 *
 * People who ask their system for less motion get the browser's own
 * scrolling: nothing is created, and holding the page falls back to stopping
 * the wheel and the finger on the element that is open.
 */
let lenis: Lenis | null = null
/** How many things are holding the page still right now. */
let holds = 0

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Starts smooth scrolling for as long as the calling component is on the page. */
export function useSmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return
    const instance = new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 })
    lenis = instance
    if (holds > 0) instance.stop()
    return () => {
      instance.destroy()
      if (lenis === instance) lenis = null
    }
  }, [])
}

/**
 * Holds the page still (wheel, finger and keys no longer scroll it) until
 * the function it returns is called. Several holds can overlap; the page
 * moves again when the last one lets go.
 */
export function holdScroll() {
  holds += 1
  lenis?.stop()
  const root = document.documentElement
  root.dataset.held = 'true'
  let released = false
  return () => {
    if (released) return
    released = true
    holds -= 1
    if (holds > 0) return
    delete root.dataset.held
    lenis?.start()
  }
}

/** Scrolls to a place on the page: smoothly when smooth scrolling is on, at once otherwise. */
export function scrollToTop(top: number) {
  if (lenis) lenis.scrollTo(top)
  else window.scrollTo({ top })
}
