import { useEffect, useRef } from 'react'

/**
 * Runs `update` once now and then once per frame in which the page has
 * scrolled or been resized. For sections that move with the scroll: they
 * read their own position and write a few CSS variables.
 */
export function useScrollFrame(update: () => void) {
  const latest = useRef(update)
  useEffect(() => {
    latest.current = update
  })

  useEffect(() => {
    let frame = 0
    const run = () => {
      frame = 0
      latest.current()
    }
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(run)
    }
    run()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
    }
  }, [])
}
