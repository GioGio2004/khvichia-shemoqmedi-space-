import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { hero } from '../content/hero'
import { footerWord, road } from '../content/road'
import { scrollLength } from './timeline'

// three.js is only needed for the letters, so it is a separate file, fetched when the footer comes near (see `near`).
const Letters = lazy(() => import('./Letters'))

// One photo per letter: the last photos of the side scroll, in its order.
const word = footerWord.slice(0, road.length)
const photos = road.slice(-word.length)
const year = new Date().getFullYear()

/** If the browser cannot draw the letters (no WebGL), the word is simply set in type. */
class LettersBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * The end of the page, and it starts where the side scroll stops: the photos
 * of the side scroll leave their row and line up, each is trimmed to a
 * letter of the word, the stage turns orange while the word grows to fill
 * the screen, and the letters fill with black. A last line with the name and
 * a way back up closes it.
 *
 * The section is a few screens tall and its stage stays in view the whole
 * way. The letters are drawn on a layer over the whole screen, because the
 * photos start moving while the footer is still coming up.
 */
export function Footer() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  // True from one screen before the footer shows until one screen after it has gone.
  const [inView, setInView] = useState(false)
  /** True from the first time the footer is within four screens of the viewport: only then are the letters fetched and started, well before they are needed. */
  const [near, setNear] = useState(false)
  // True once the orange has taken over the stage.
  const [flooded, setFlooded] = useState(false)
  const taken = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '100% 0px' })
    observer.observe(section.current!)
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        approach.disconnect()
      },
      { rootMargin: '400% 0px' },
    )
    approach.observe(section.current!)
    return () => {
      observer.disconnect()
      approach.disconnect()
      document.documentElement.removeAttribute('data-handoff')
    }
  }, [])

  // Once the footer is far away nothing is drawn here any more, so the side scroll must show its own photos again.
  useEffect(() => {
    if (inView) return
    taken.current = false
    document.documentElement.removeAttribute('data-handoff')
  }, [inView])

  // While the photos are drawn here, the side scroll hides its own (see the stylesheet).
  const onTaken = useCallback((now: boolean) => {
    if (now === taken.current) return
    taken.current = now
    document.documentElement.toggleAttribute('data-handoff', now)
  }, [])

  const onEnding = useCallback((flood: number, ink: number) => {
    stage.current?.style.setProperty('--flood', flood.toFixed(4))
    stage.current?.style.setProperty('--ink', ink.toFixed(4))
    setFlooded(flood > 0.94)
  }, [])

  // The section is dark until the orange covers it; the menu tab and the monogram follow that.
  useEffect(() => {
    window.dispatchEvent(new Event('themechange'))
  }, [flooded])

  return (
    <footer
      ref={section}
      id="contact"
      className="footer"
      data-theme={flooded ? 'accent' : 'dark'}
      style={{ height: `calc(${(scrollLength + 1).toFixed(2)} * 100svh)` }}
    >
      <div ref={stage} className="footer-stage">
        <div className="footer-flood" aria-hidden />
        <div className="footer-letters" data-live={inView || undefined} aria-hidden>
          <LettersBoundary fallback={<p className="footer-word">{word}</p>}>
            {near ? (
              <Suspense fallback={null}>
                <Letters word={word} photos={photos} section={section} onTaken={onTaken} onEnding={onEnding} inView={inView} />
              </Suspense>
            ) : null}
          </LettersBoundary>
        </div>

        <div className="footer-line">
          <p>
            © {year} {hero.name}
          </p>
          <a href="#top">Back to top</a>
        </div>
      </div>
    </footer>
  )
}
