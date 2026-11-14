import { useEffect, useState } from 'react'

/**
 * Tells a fixed element at the top of the screen whether a dark part of the
 * page is passing under it: true while any element marked data-theme="dark"
 * covers the line `y` pixels from the top. Sections that change their own
 * theme announce it with a "themechange" event on the window.
 */
export function useOnDark(y: number) {
  const [onDark, setOnDark] = useState(false)

  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const dark = [...document.querySelectorAll('[data-theme="dark"]')].some((element) => {
        const box = element.getBoundingClientRect()
        return box.top <= y && box.bottom > y
      })
      setOnDark(dark)
    }
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    window.addEventListener('themechange', queue)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      window.removeEventListener('themechange', queue)
    }
  }, [y])

  return onDark
}
