import 'lenis/dist/lenis.css'

import Lenis from 'lenis'
import { useEffect, useSyncExternalStore } from 'react'

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

const LESS_MOTION = '(prefers-reduced-motion: reduce)'

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia(LESS_MOTION).matches

const watchMotion = (changed: () => void) => {
  const query = window.matchMedia(LESS_MOTION)
  query.addEventListener('change', changed)
  return () => query.removeEventListener('change', changed)
}

/**
 * Whether the visitor asks for less motion, for components that draw something else then. The built page is
 * written without knowing (it says false), so the first drawing matches it and the answer arrives right after;
 * it also follows the setting if it is changed while the page is open.
 */
export function useReducedMotion() {
  return useSyncExternalStore(watchMotion, reducedMotion, () => false)
}

/** What wakes smooth scrolling up: the first sign that the visitor is about to move the page or press something. */
const WAKE = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const

/**
 * Starts smooth scrolling for as long as the calling component is on the page. It starts with the visitor's first
 * wheel, touch, press or key rather than at load: until then nothing scrolls, and its frame loop would only keep the
 * browser busy while the page is opening. A press comes before its click, so links to a place on the page are
 * already smooth on the first click.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return
    let instance: Lenis | null = null
    let gone = false
    const wake = () => {
      WAKE.forEach((name) => window.removeEventListener(name, wake, true))
      if (gone) return
      instance = new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 })
      lenis = instance
      if (holds > 0) instance.stop()
    }
    WAKE.forEach((name) => window.addEventListener(name, wake, { capture: true, passive: true }))
    return () => {
      gone = true
      WAKE.forEach((name) => window.removeEventListener(name, wake, true))
      instance?.destroy()
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
