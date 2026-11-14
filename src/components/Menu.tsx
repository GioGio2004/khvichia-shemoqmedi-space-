import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import crow from '../assets/brand/crow-shape.png'
import { contact, cv, type Way } from '../content/contact'
import { hero } from '../content/hero'
import { profile } from '../content/profile'
import { sections } from '../content/sections'
import { holdScroll } from '../lib/scroll'
import { SHEET_EVENT, type Sheet } from '../lib/sheet'
import { useOnDark } from '../lib/useOnDark'

/** The small orange drawing beside each way to reach him. */
function Icon({ kind }: { kind: Way['kind'] }) {
  // The crow is a picture, not a drawing: its shape is cut out of the icon's colour.
  if (kind === 'shemoqmedi') return <span className="menu-crow" style={{ maskImage: `url(${crow})`, WebkitMaskImage: `url(${crow})` }} />
  if (kind === 'linkedin')
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="9.5" width="3.4" height="10.5" />
        <circle cx="5.7" cy="5.6" r="2" />
        <path d="M10.2 9.5h3.2v1.5c.6-1 1.8-1.8 3.5-1.8 3 0 3.9 1.9 3.9 4.8V20h-3.4v-5.3c0-1.4-.4-2.4-1.7-2.4-1.5 0-2.1 1-2.1 2.5V20h-3.4z" />
      </svg>
    )
  if (kind === 'github')
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'email' ? (
        <>
          <rect x="3" y="5" width="18" height="14" />
          <path d="M3 7l9 6.5L21 7" />
        </>
      ) : (
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      )}
    </svg>
  )
}

/** A small arrow for the text links on the sheets. */
function Arrow() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M1.5 6h9M6.5 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

const email = contact.find((way) => way.kind === 'email')
/** The headline of the About sheet without its last full stop: the page sets that one in orange. */
const headline = profile.headline.replace(/\.$/, '')

/**
 * The tab in the top right corner. Closed it only says "Menu"; opened it
 * stretches along the top edge and shows what is in `sections` (on phones it
 * grows downwards instead and lists them one under another), and "Menu"
 * gives way to a small "Close" pill, set apart so it does not read as one
 * more section. At the end of the list, two quiet links are always one step
 * away: his CV and his email.
 *
 * "About" and "Contact" do not go anywhere: pressing one brings the bar all
 * the way down, over the whole screen, as a sheet. About is white: one
 * sentence about him, a paragraph, and what stands behind it (teaching, the
 * hackathon, the conference, his degree). Contact is charcoal: his name in
 * orange outline, a few words, the ways to reach him in white with orange
 * icons, and the button that downloads his CV. Pressing the same word again,
 * or closing the menu, folds the sheet away. While a sheet is down the page
 * behind it does not scroll, and the Tab key stays inside the menu.
 *
 * Other parts of the page can ask for a sheet (see lib/sheet.ts).
 *
 * The tab is charcoal over the light parts of the page and light over the
 * dark ones. On a page other than the home page (`home` set) the section
 * links lead back to the home page's sections.
 */
export function Menu({ home = false }: { home?: boolean }) {
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const onDark = useOnDark(32)
  const root = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  /** What had the focus before something outside the menu asked for a sheet: it gets the focus back when the menu closes. */
  const asker = useRef<HTMLElement | null>(null)
  const shown = open ? sheet : null
  const to = (id: string) => `${home ? '/' : ''}#${id}`

  /** Closes everything. If the focus was inside the menu it goes back to where the person came from. */
  const close = useCallback(() => {
    const inside = root.current?.contains(document.activeElement)
    setOpen(false)
    setSheet(null)
    if (inside) (asker.current ?? toggle.current)?.focus({ preventScroll: true })
    asker.current = null
  }, [])

  // Escape and a press outside the bar close it. (A sheet covers the screen, so there is no outside then.)
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const onPress = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPress)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPress)
    }
  }, [open, close])

  // Another part of the page asks for a sheet.
  useEffect(() => {
    const onAsk = (event: Event) => {
      asker.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setOpen(true)
      setSheet((event as CustomEvent<Sheet>).detail)
    }
    window.addEventListener(SHEET_EVENT, onAsk)
    return () => window.removeEventListener(SHEET_EVENT, onAsk)
  }, [])

  // While a sheet is down: the page behind is held still, the sheet takes the focus if it came from outside the
  // menu, and Tab goes round inside the menu instead of into the covered page. If the sheet itself is taller than
  // the screen (a small phone), it scrolls.
  useEffect(() => {
    const host = root.current
    if (!shown || !host) return
    const release = holdScroll()
    if (!host.contains(document.activeElement)) host.querySelector<HTMLElement>(`#menu-${shown}`)?.focus({ preventScroll: true })

    const hold = (event: Event) => {
      if (host.scrollHeight <= host.clientHeight + 1) event.preventDefault()
    }
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const stops = [...host.querySelectorAll<HTMLElement>('a[href], button')].filter((element) => !element.closest('[inert]'))
      const first = stops[0]
      const last = stops[stops.length - 1]
      if (!first || !last) return
      const at = document.activeElement
      if (event.shiftKey && (at === first || !host.contains(at))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (at === last || !host.contains(at))) {
        event.preventDefault()
        first.focus()
      }
    }
    host.addEventListener('wheel', hold, { passive: false })
    host.addEventListener('touchmove', hold, { passive: false })
    window.addEventListener('keydown', onTab)
    return () => {
      release()
      host.removeEventListener('wheel', hold)
      host.removeEventListener('touchmove', hold)
      window.removeEventListener('keydown', onTab)
    }
  }, [shown])

  return (
    <header
      ref={root}
      className="menu"
      data-open={open}
      data-sheet={shown ?? undefined}
      data-contact={shown === 'contact'}
      data-tone={onDark ? 'light' : 'dark'}
      data-lenis-prevent={shown ? true : undefined}
      style={{ '--count': sections.length } as CSSProperties}
    >
      {/* First in the page's order, so Tab goes from it into the links it has just uncovered. */}
      <button
        ref={toggle}
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="menu-links"
        aria-label={open ? 'Close the menu' : 'Open the menu'}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="menu-word" aria-hidden>
          <span>Menu</span>
          <span>
            <span className="menu-close">
              Close
              <svg viewBox="0 0 10 10" fill="none">
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
              </svg>
            </span>
          </span>
        </span>
      </button>

      <nav id="menu-links" className="menu-links" aria-label="Sections" inert={!open}>
        <ul>
          {sections.map((section, i) => (
            <li key={section.id} style={{ '--i': i } as CSSProperties}>
              {section.sheet ? (
                <button
                  type="button"
                  className="menu-link"
                  aria-expanded={shown === section.sheet}
                  aria-controls={`menu-${section.sheet}`}
                  data-on={shown === section.sheet}
                  onClick={() => setSheet(shown === section.sheet ? null : section.sheet!)}
                >
                  {section.label}
                </button>
              ) : (
                <a className="menu-link" href={to(section.id)} onClick={close}>
                  {section.label}
                </a>
              )}
            </li>
          ))}
          {/* Always one step away, on every page: the CV and the email. */}
          <li className="menu-quick" style={{ '--i': sections.length } as CSSProperties}>
            <a href={cv.file} download>
              CV
            </a>
            {email ? <a href={email.href}>Email</a> : null}
          </li>
        </ul>
      </nav>

      <div id="menu-about" className="menu-sheet menu-about" role="region" aria-label="About Giorgi Khvichia" tabIndex={-1} inert={shown !== 'about'}>
        <p className="menu-kicker">{profile.descriptor.join(' / ')}</p>
        <h2 className="menu-headline">
          {headline}
          <b>.</b>
        </h2>
        <div className="menu-about-body">
          <p className="menu-about-text">{profile.about}</p>
          <ul className="menu-creds">
            {profile.credentials.map((item) => (
              <li key={item.title}>
                <small>{item.label}</small>
                <strong>{item.title}</strong>
                {item.where || item.when ? <span>{[item.where, item.when].filter(Boolean).join(' · ')}</span> : null}
                {item.note ? <span>{item.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="menu-about-foot">
          <ul className="menu-proof">
            {profile.proof.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="menu-actions">
            <a href={cv.file} download>
              Download CV <Arrow />
            </a>
            {email ? (
              <a href={email.href}>
                Email me <Arrow />
              </a>
            ) : null}
            <a href={to('work')} onClick={close}>
              Explore work <Arrow />
            </a>
          </p>
        </div>
      </div>

      <div id="menu-contact" className="menu-sheet menu-contact" role="region" aria-label="Contact" tabIndex={-1} inert={shown !== 'contact'}>
        <p className="menu-name">{hero.name}</p>
        <div className="menu-intro">
          <p>{profile.contactIntro}</p>
          <p className="menu-actions">
            {email ? (
              <a href={email.href}>
                Email me <Arrow />
              </a>
            ) : null}
            <a href={to('work')} onClick={close}>
              Explore work <Arrow />
            </a>
          </p>
        </div>
        <div className="menu-reach">
          <ul>
            {contact.map((way, i) => (
              <li key={way.kind} style={{ '--i': i + 1 } as CSSProperties}>
                <a href={way.href} {...(way.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  <span className="menu-icon" aria-hidden>
                    <Icon kind={way.kind} />
                  </span>
                  <span className="menu-way">
                    <small>{way.label}</small>
                    <span>{way.text}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="menu-cv" style={{ '--i': contact.length + 1 } as CSSProperties}>
            <a className="menu-cv-main" href={cv.file} download>
              <span>{cv.label}</span>
              <span className="menu-cv-mark" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <path d="M12 4v13M6 12l6 6 6-6M5 21h14" />
                </svg>
              </span>
            </a>
            <a className="menu-cv-other" href={cv.other.file} download>
              {cv.other.label}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
