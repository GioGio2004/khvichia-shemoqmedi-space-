import { Component, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { work } from '../content/work'
import { lazyWithRetry } from '../lib/retry'
import { holdScroll } from '../lib/scroll'
import type { GalleryApi } from './Gallery'
import { BAR, openWindow } from './layout'

// three.js is only needed for the gallery, so it is a separate file, fetched when the section comes near (see `near`).
const Gallery = lazyWithRetry(() => import('./Gallery'))

const two = (n: number) => String(n).padStart(2, '0')
const sites = work.map((item) => item.site)
/** Where the last project looked at is remembered for this visit, so coming back from its page shows it again. */
const KEEP = 'gk:work'
/** How long a live site may take to answer before the window offers a way out (milliseconds). */
const PATIENCE = 8000

/** If the browser cannot draw the gallery (no WebGL), a plain row of the projects that scrolls sideways takes its place. */
class GalleryBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden style={back ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M1.5 6h9M6.5 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

/**
 * The work section: one screen, charcoal, with his projects as large bent
 * panels on a curved row. The row is dragged left and right, moved with the
 * arrow keys or the two arrow buttons, and moves on by itself every few
 * seconds while nobody is using it. The name of the project in the middle
 * stands above the row; under the row are one line about it and three
 * separate ways in:
 *
 *   Read case study   its own page on this site (/work/<slug>)
 *   Live preview      the panel un-bends into a flat window (drawn by the
 *                     gallery) and the site itself is laid over it, running
 *                     live. Clicking the screen of the middle panel does the
 *                     same. Nothing is loaded before that.
 *   Visit live        the site, in a new tab
 *
 * The preview window keeps the keyboard inside it, holds the page still,
 * closes with Escape, and hands the focus back to where it was. If the site
 * has not answered after a few seconds it says so and offers the new tab.
 */
export function Work() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const live = useRef<HTMLDivElement>(null)
  const closer = useRef<HTMLButtonElement>(null)
  const api = useRef<GalleryApi | null>(null)
  /** True while the row should not move on by itself: the keyboard is in the section, or the pointer is on its buttons. */
  const paused = useRef(false)
  /** What had the focus when the preview was opened. */
  const opener = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)
  /** True from the first time the section is within a screen and a half of the viewport: only then is the gallery fetched and started. */
  const [near, setNear] = useState(false)
  const [active, setActive] = useState(0)
  /** The project the row starts on: the one named in the address (?work=slug), or the last one looked at in this visit. */
  const [start, setStart] = useState(0)
  /** What a screen reader is told: only changes a person made, never the row moving on by itself. */
  const [spoken, setSpoken] = useState('')
  const [open, setOpen] = useState(false)
  /** True while the opened panel is fully flat, so the live site can sit on it. */
  const [flat, setFlat] = useState(false)
  /** The site whose live page has finished loading. */
  const [loaded, setLoaded] = useState<string | null>(null)
  /** True when the live page has kept the window waiting too long. */
  const [slow, setSlow] = useState(false)
  /** The opened window's place inside the section, in pixels. */
  const [win, setWin] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const item = work[active]
  const site = item.site

  useEffect(() => {
    const element = section.current!
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 })
    observer.observe(element)
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        approach.disconnect()
      },
      { rootMargin: '150% 0px' },
    )
    approach.observe(element)
    const resize = new ResizeObserver(() => setWin(openWindow(element.clientWidth, element.clientHeight)))
    resize.observe(element)

    // Which project to start on. Read one frame after the page has taken over, so the first drawing matches the
    // page as it was built (which always starts on the first project).
    const recall = requestAnimationFrame(() => {
      let wanted: string | null = null
      try {
        wanted = new URLSearchParams(window.location.search).get('work') ?? window.sessionStorage.getItem(KEEP)
      } catch {
        // Storage can be switched off; the row then starts on the first project.
      }
      const index = work.findIndex((entry) => entry.slug === wanted)
      if (index > 0) {
        setStart(index)
        setActive(index)
      }
    })

    return () => {
      cancelAnimationFrame(recall)
      observer.disconnect()
      approach.disconnect()
      resize.disconnect()
    }
  }, [])

  const onActive = useCallback((index: number, byPerson: boolean) => {
    setActive(index)
    if (byPerson) setSpoken(`${work[index].title}, project ${index + 1} of ${work.length}`)
    try {
      window.sessionStorage.setItem(KEEP, work[index].slug)
    } catch {
      // Nothing to remember it with.
    }
  }, [])

  const onOpen = useCallback(() => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setOpen(true)
  }, [])
  const close = useCallback(() => setOpen(false), [])
  const onFlat = useCallback((amount: number) => {
    section.current?.style.setProperty('--flat', amount.toFixed(4))
    setFlat(amount > 0.985)
  }, [])

  // Opening brings the section squarely into view; Escape closes. Closing gives the focus back.
  useEffect(() => {
    if (!open) return
    const element = section.current
    if (element) window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      setSlow(false)
      setLoaded(null)
      const back = opener.current
      opener.current = null
      if (back?.isConnected) back.focus({ preventScroll: true })
    }
  }, [open])

  // Once the window is flat: the page behind is held still, the Close button takes the focus, and Tab stays inside
  // the window. If the site has not answered after a while, the window says so.
  const showing = open && flat
  useEffect(() => {
    if (!showing) return
    const release = holdScroll()
    closer.current?.focus({ preventScroll: true })
    const onTab = (event: KeyboardEvent) => {
      const host = live.current
      if (event.key !== 'Tab' || !host) return
      const stops = [...host.querySelectorAll<HTMLElement>('a[href], button, iframe')]
      const first = stops[0]
      const last = stops[stops.length - 1]
      const at = document.activeElement
      if (event.shiftKey && (at === first || !host.contains(at))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (at === last || !host.contains(at))) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onTab)
    const wait = window.setTimeout(() => setSlow(true), PATIENCE)
    return () => {
      release()
      window.removeEventListener('keydown', onTab)
      window.clearTimeout(wait)
    }
  }, [showing])

  const waiting = site.live && loaded !== site.slug

  return (
    <section
      ref={section}
      id="work"
      className="work"
      data-theme="dark"
      data-open={open}
      data-flat={showing}
      aria-roledescription="carousel"
      aria-label="Selected work"
      onFocus={() => (paused.current = true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) paused.current = false
      }}
    >
      <h2 className="sr-only">Work</h2>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {spoken}
      </p>

      <div
        ref={stage}
        className="work-stage"
        tabIndex={open ? -1 : 0}
        role="group"
        aria-label="The row of projects. Drag it, or use the left and right arrow keys."
      >
        <GalleryBoundary
          fallback={
            <ul className="work-plain">
              {work.map((entry) => (
                <li key={entry.slug}>
                  <a href={`/work/${entry.slug}`}>{entry.title}</a>
                  <a href={entry.site.url} target="_blank" rel="noopener noreferrer">
                    Visit live
                  </a>
                </li>
              ))}
            </ul>
          }
        >
          {near ? (
            <Suspense fallback={null}>
              <Gallery sites={sites} stage={stage} inView={inView} open={open} initial={start} api={api} paused={paused} onActive={onActive} onOpen={onOpen} onFlat={onFlat} />
            </Suspense>
          ) : null}
        </GalleryBoundary>
      </div>

      {/* Remounted for every project, so the name comes up afresh each time. */}
      <div key={item.slug} className="work-head">
        <h3>
          <span>{item.title}</span>
        </h3>
        <p>{item.eyebrow}</p>
      </div>

      {/* Under the row: where the row is, one line about the project, the three ways in, and what he did on it. */}
      <div className="work-foot" inert={open} onPointerEnter={() => (paused.current = true)} onPointerLeave={() => (paused.current = false)}>
        <div className="work-nav">
          <button type="button" aria-label="Previous project" onClick={() => api.current?.step(-1)}>
            <Chevron back />
          </button>
          <p aria-hidden>
            {two(active + 1)} / {two(work.length)}
          </p>
          <button type="button" aria-label="Next project" onClick={() => api.current?.step(1)}>
            <Chevron />
          </button>
        </div>

        <div key={item.slug} className="work-story">
          <p className="work-tagline">{item.tagline}</p>
          <p className="work-actions">
            <a className="work-primary" href={`/work/${item.slug}`} aria-label={`Read the ${item.title} case study`}>
              <span data-wide>Read case study</span>
              <span data-narrow>Case study</span>
              <Chevron />
            </a>
            <button type="button" onClick={onOpen} aria-label={`${site.live ? 'Live preview' : 'Preview'} of ${item.title}, opens in a window on this page`}>
              <span data-wide>{site.live ? 'Live preview' : 'Preview'}</span>
              <span data-narrow>Preview</span>
            </button>
            <a href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${site.domain}, opens in a new tab`}>
              <span data-wide>Visit live</span>
              <span data-narrow>Visit</span>
              <span aria-hidden>↗</span>
            </a>
          </p>
        </div>

        <p key={`${item.slug}-meta`} className="work-meta">
          <span>{item.role}</span>
          <span>{item.status}</span>
        </p>
      </div>

      {/* The opened window: a bar, and under it the site itself, laid exactly over the flattened panel. */}
      {open ? (
        <div
          ref={live}
          className="work-live"
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title}: ${site.live ? 'live preview' : 'preview'}`}
          style={{ left: win.left, top: win.top - BAR, width: win.width, height: win.height + BAR, '--bar': `${BAR}px` } as CSSProperties}
        >
          <div className="work-bar">
            <span>{site.domain}</span>
            <span>
              <a href={`/work/${item.slug}`}>Case study</a>
              <a href={site.url} target="_blank" rel="noopener noreferrer">
                <span data-wide>Open in a new tab</span>
                <span data-narrow>New tab</span> <span aria-hidden>↗</span>
              </a>
              <button ref={closer} type="button" onClick={close}>
                Close
              </button>
            </span>
          </div>
          <div className="work-view">
            {site.live ? (
              <>
                <iframe
                  src={site.url}
                  title={`${item.title}: the live site, ${site.domain}`}
                  data-ready={loaded === site.slug}
                  onLoad={() => setLoaded(site.slug)}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-pointer-lock"
                  allow="fullscreen; autoplay"
                />
                {waiting ? (
                  <p className="work-wait" role="status">
                    {slow ? (
                      <>
                        {site.domain} is taking a while to answer.{' '}
                        <a href={site.url} target="_blank" rel="noopener noreferrer">
                          Open it in a new tab
                        </a>
                      </>
                    ) : (
                      <>Loading {site.domain}</>
                    )}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="work-still">
                <img src={site.long} alt={`A picture of ${site.domain}, the whole first page.`} draggable={false} />
                <p>
                  This is a picture: {site.domain} does not allow itself to be shown inside another page from this address.{' '}
                  <a href={site.url} target="_blank" rel="noopener noreferrer">
                    Open the live site
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
