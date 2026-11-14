import { Fragment, useEffect, useRef, type CSSProperties } from 'react'
import { hero } from '../content/hero'
import { useScrollFrame } from '../lib/useScrollFrame'
import { silhouette } from './silhouette'

const two = (n: number) => String(n).padStart(2, '0')

/** The name, word by word, with the position of each word's first letter in the whole name (for the stagger). */
const words = hero.name.split(' ').map((word, i, all) => ({
  letters: [...word],
  start: all.slice(0, i).join('').length,
  last: i === all.length - 1,
}))

/**
 * The opening screen, on a four-column grid with hairlines: the name, a small
 * block of facts above it, and the silhouette in front of one orange block,
 * standing on a charcoal strip.
 *
 * The opening plays once, in this order: the strip comes up, the block grows
 * out of it, the silhouette rises behind the strip's edge, and the name comes
 * up letter by letter, ending on the orange full stop.
 *
 * Afterwards the silhouette leans a few pixels towards the pointer and the
 * block a little the other way (--mx and --my, each -1..1), which gives the
 * cut-out some depth. The screen scrolls away with the page, but not as one
 * block: the facts hurry ahead, the name follows, and the silhouette sinks
 * behind the strip (--lift, 0..1).
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)

  // How far the page has scrolled past the hero (0..1). The stylesheet uses it to let the parts leave at different speeds.
  useScrollFrame(() => {
    const lift = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1)
    root.current?.style.setProperty('--lift', lift.toFixed(4))
  })

  // The lean towards the pointer, eased so it never jumps. Mouse only, and not for people who ask for less motion.
  useEffect(() => {
    const element = root.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const aim = { x: 0, y: 0 }
    const now = { x: 0, y: 0 }
    let frame = 0
    const step = () => {
      now.x += (aim.x - now.x) * 0.09
      now.y += (aim.y - now.y) * 0.09
      element.style.setProperty('--mx', now.x.toFixed(4))
      element.style.setProperty('--my', now.y.toFixed(4))
      frame = Math.abs(aim.x - now.x) + Math.abs(aim.y - now.y) > 0.002 ? requestAnimationFrame(step) : 0
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      aim.x = (event.clientX / window.innerWidth) * 2 - 1
      aim.y = (event.clientY / window.innerHeight) * 2 - 1
      if (!frame) frame = requestAnimationFrame(step)
    }
    element.addEventListener('pointermove', move)
    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <section ref={root} id="top" className="hero">
      {/* The grid's hairlines: three down the page on the strip's dividers, and one across at the top of the orange block. */}
      <div className="hero-lines" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="hero-rule">
        <div className="hero-about">
          <p className="hero-status">{hero.status}</p>
        </div>
        <p className="hero-place">{hero.place}</p>
      </div>

      <h1 className="hero-title" aria-label={hero.name}>
        {words.map((word, w) => (
          <Fragment key={w}>
            <span className="hero-word" aria-hidden>
              {word.letters.map((letter, i) => (
                <span key={i} style={{ '--c': word.start + i } as CSSProperties}>
                  {letter}
                </span>
              ))}
              {word.last ? <b style={{ '--c': word.start + word.letters.length } as CSSProperties}>.</b> : null}
            </span>
            {word.last ? null : ' '}
          </Fragment>
        ))}
      </h1>

      <div className="hero-portrait" aria-hidden>
        <div className="hero-block" />
        <svg className="hero-figure" viewBox={`0 0 ${silhouette.width} ${silhouette.height}`}>
          <defs>
            <clipPath id="hero-shape">
              <path d={silhouette.path} clipRule="evenodd" />
            </clipPath>
            {/* A fine pale grain, so the silhouette reads as print and not as a flat fill. */}
            <filter id="hero-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.24" numOctaves="2" seed="7" />
              <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.3 -0.38" />
            </filter>
          </defs>
          <path d={silhouette.path} fillRule="evenodd" />
          <rect width={silhouette.width} height={silhouette.height} filter="url(#hero-grain)" clipPath="url(#hero-shape)" opacity="0.09" />
        </svg>
      </div>

      <ul className="hero-band" data-theme="dark">
        {hero.fields.map((field, i) => (
          <li key={field} style={{ '--i': i } as CSSProperties}>
            <span>{two(i + 1)}</span>
            <strong>{field}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}
