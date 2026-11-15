import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { hero } from '../content/hero'
import { afterGallery } from '../lib/ready'
import { lazyWithRetry } from '../lib/retry'
import { reducedMotion, useReducedMotion } from '../lib/scroll'
import { openSheet } from '../lib/sheet'
import { footerWord, road } from '../content/road'
import { scrollLength } from './timeline'

// three.js is only needed for the letters, so it is a separate file, fetched when the footer comes near (see `near`).
const Letters = lazyWithRetry(() => import('./Letters'))

// One photo per letter: the last photos of the side scroll, in its order.
const word = footerWord.slice(0, road.length)
const photos = road.slice(-word.length)
/** The word in two lines, as the letters stand on a phone once they fill the screen. */
const lines = [word.slice(0, Math.ceil(word.length / 2)), word.slice(Math.ceil(word.length / 2))]
const year = new Date().getFullYear()

/** If the browser cannot draw the letters (no WebGL), the word is simply set in type. */
class LettersBoundary extends Component<{ fallback: ReactNode; onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail()
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
 *
 * For people who ask for less motion none of that plays: the section is one
 * screen, already in its last state (the word in black type on the orange,
 * and the last line), and no 3D is loaded at all.
 */
export function Footer() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  // True from one screen before the footer shows until one screen after it has gone.
  const [inView, setInView] = useState(false)
  /**
   * True a moment after the 3D gallery is ready (see lib/ready.ts), or from the first time the footer is within
   * four screens of the viewport, whichever comes first: only then are the letters fetched and built. They need
   * their code, their font and six photos, so they start as early as they can without getting in the gallery's way.
   */
  const [near, setNear] = useState(false)
  // True once the orange has taken over the stage.
  const [flooded, setFlooded] = useState(false)
  // True once the last line (copyright, Contact, Back to top) has started to show; until then it cannot be reached.
  const [ended, setEnded] = useState(false)
  // True if the letters could not be drawn: the word is plain type and the last line is simply there.
  const [plain, setPlain] = useState(false)
  const taken = useRef(false)
  const calm = useReducedMotion()

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
    let later = 0
    const stop = afterGallery(() => {
      later = window.setTimeout(() => setNear(true), 400)
    })
    return () => {
      observer.disconnect()
      approach.disconnect()
      stop()
      clearTimeout(later)
      document.documentElement.removeAttribute('data-handoff')
    }
  }, [])

  // Once the footer is far away (or nothing is drawn here at all) the side scroll must show its own photos again.
  useEffect(() => {
    if (inView && !calm) return
    taken.current = false
    document.documentElement.removeAttribute('data-handoff')
  }, [inView, calm])

  // While the photos are drawn here, the side scroll hides its own (see the stylesheet).
  const onTaken = useCallback((now: boolean) => {
    if (now === taken.current || reducedMotion()) return
    taken.current = now
    document.documentElement.toggleAttribute('data-handoff', now)
  }, [])

  const onEnding = useCallback((flood: number, ink: number) => {
    stage.current?.style.setProperty('--flood', flood.toFixed(4))
    stage.current?.style.setProperty('--fill', ink.toFixed(4))
    setFlooded(flood > 0.94)
    setEnded(ink > 0.76)
  }, [])

  // The section is dark until the orange covers it; the menu tab and the monogram follow that.
  const orange = flooded || calm
  useEffect(() => {
    window.dispatchEvent(new Event('themechange'))
  }, [orange])

  return (
    <footer
      ref={section}
      id="contact"
      className="footer"
      data-theme={orange ? 'accent' : 'dark'}
      style={{ height: `calc(${(scrollLength + 1).toFixed(2)} * 100svh)` }}
    >
      <div ref={stage} className="footer-stage" data-plain={plain || undefined}>
        <div className="footer-flood" aria-hidden />
        <div className="footer-letters" data-live={inView || undefined} aria-hidden>
          <LettersBoundary fallback={<p className="footer-word">{word}</p>} onFail={() => setPlain(true)}>
            {near && !calm ? (
              <Suspense fallback={null}>
                <Letters word={word} photos={photos} section={section} onTaken={onTaken} onEnding={onEnding} inView={inView} />
              </Suspense>
            ) : null}
          </LettersBoundary>
        </div>
        {/* The last state of the word in plain type, shown only to people who ask for less motion (see the stylesheet). */}
        <p className="footer-still" aria-hidden>
          <span>
            {lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        </p>

        <div className="footer-line" inert={!(ended || plain || calm)}>
          <p>
            © <span suppressHydrationWarning>{year}</span> <span className="footer-name">{hero.name}</span>
          </p>
          <p className="footer-links">
            <button type="button" onClick={() => openSheet('contact')}>
              Contact
            </button>
            <a href="#top">Back to top</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
