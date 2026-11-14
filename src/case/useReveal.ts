import { useEffect, type RefObject } from 'react'
import { reducedMotion } from '../lib/scroll'

/**
 * Lets the parts of a page come up softly as they are scrolled into view.
 *
 * Every element marked data-reveal inside `root` that is still below the
 * screen when the page starts is given data-seen="false" (the stylesheet
 * holds it back), and data-seen="true" once it enters the screen (the
 * stylesheet lets it come up). Elements already on screen are left alone,
 * so nothing that is visible blinks. Without scripts, and for people who ask
 * for less motion, nothing is ever held back: everything is simply there.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current
    if (!host || reducedMotion() || !('IntersectionObserver' in window)) return
    const all = [...host.querySelectorAll<HTMLElement>('[data-reveal]')]
    const waiting = all.filter((element) => element.getBoundingClientRect().top > window.innerHeight * 0.94)
    for (const element of waiting) element.dataset.seen = 'false'
    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.seen = 'true'
          watcher.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -7% 0px', threshold: 0.01 },
    )
    for (const element of waiting) watcher.observe(element)
    return () => {
      watcher.disconnect()
      for (const element of all) delete element.dataset.seen
    }
  }, [root])
}
