import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { sites } from '../content/sites'
import { BAR, openWindow } from './layout'

// three.js is only needed for the gallery, so it loads apart from the first screen.
const Gallery = lazy(() => import('./Gallery'))

const two = (n: number) => String(n).padStart(2, '0')

/** If the browser cannot draw the gallery (no WebGL), a plain row of links that scrolls sideways takes its place. */
class GalleryBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * The work section: one screen, charcoal, with his websites as large bent
 * panels on a curved row. The row is dragged left and right and moves on by
 * itself every few seconds. The name of the site in the middle stands above
 * the row, its number below.
 *
 * Clicking the screen of the middle panel opens it: the panel un-bends into a
 * flat window (drawn by the gallery), and once it is flat the site itself is
 * laid over it, running live. Closing takes the site away and the panel
 * bends back into its place in the row.
 */
export function Work() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  /** True while the opened panel is fully flat, so the live site can sit on it. */
  const [flat, setFlat] = useState(false)
  /** The site whose live page has finished loading. */
  const [loaded, setLoaded] = useState<string | null>(null)
  /** The opened window's place inside the section, in pixels. */
  const [win, setWin] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const site = sites[active]

  useEffect(() => {
    const element = section.current!
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 })
    observer.observe(element)
    const resize = new ResizeObserver(() => setWin(openWindow(element.clientWidth, element.clientHeight)))
    resize.observe(element)
    return () => {
      observer.disconnect()
      resize.disconnect()
    }
  }, [])

  const onOpen = useCallback(() => setOpen(true), [])
  const onFlat = useCallback((amount: number) => {
    section.current?.style.setProperty('--flat', amount.toFixed(4))
    setFlat(amount > 0.985)
  }, [])

  // Opening brings the section squarely into view; Escape closes.
  useEffect(() => {
    if (!open) return
    const element = section.current
    if (element) window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <section ref={section} id="work" className="work" data-theme="dark" data-open={open} data-flat={open && flat}>
      <h2 className="sr-only">Work</h2>

      <div
        ref={stage}
        className="work-stage"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Websites. Drag or use the left and right arrow keys; press Enter to open the one in the middle."
      >
        <GalleryBoundary
          fallback={
            <ul className="work-plain">
              {sites.map((item) => (
                <li key={item.slug}>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          }
        >
          <Suspense fallback={null}>
            <Gallery sites={sites} stage={stage} inView={inView} open={open} onActive={setActive} onOpen={onOpen} onFlat={onFlat} />
          </Suspense>
        </GalleryBoundary>
      </div>

      {/* Remounted for every site, so the name comes up afresh each time. */}
      <div key={site.slug} className="work-head" aria-live="polite">
        <h3>
          <span>{site.name}</span>
        </h3>
        <p>{site.kind}</p>
      </div>

      <p className="work-count">
        {two(active + 1)} / {two(sites.length)}
      </p>

      {/* The opened window: a bar, and under it the site itself, laid exactly over the flattened panel. */}
      {open ? (
        <div
          className="work-live"
          style={{ left: win.left, top: win.top - BAR, width: win.width, height: win.height + BAR, '--bar': `${BAR}px` } as CSSProperties}
        >
          <div className="work-bar">
            <span>{site.domain}</span>
            <span>
              <a href={site.url} target="_blank" rel="noreferrer">
                Open in a new tab
              </a>
              <button type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </span>
          </div>
          <div className="work-view">
            {site.live ? (
              <iframe
                src={site.url}
                title={site.domain}
                data-ready={loaded === site.slug}
                onLoad={() => setLoaded(site.slug)}
                allow="fullscreen; autoplay"
              />
            ) : (
              <div className="work-still">
                <img src={site.long} alt={`A picture of ${site.domain}, the whole first page.`} draggable={false} />
                <p>
                  This is a picture: {site.domain} does not allow itself to be shown inside another page yet.{' '}
                  <a href={site.url} target="_blank" rel="noreferrer">
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
