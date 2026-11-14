import { useEffect, useRef, useState, type CSSProperties } from 'react'
import crow from '../assets/brand/crow-shape.png'
import { contact, cv, type Way } from '../content/contact'
import { hero } from '../content/hero'
import { sections } from '../content/sections'
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

/**
 * The tab in the top right corner. Closed it only says "Menu"; opened it
 * stretches along the top edge and shows the page's sections (on phones it
 * grows downwards instead and lists them one under another), and "Menu"
 * gives way to a small "Close" pill, set apart so it does not read as one
 * more section.
 *
 * "Contact" does not go anywhere: pressing it brings the bar all the way
 * down, over the whole screen, as a charcoal sheet with his name in orange
 * outline, the ways to reach him in white with orange icons, and the button
 * that downloads his CV. Pressing it again, or closing the menu, folds the
 * sheet away. While it is down the page behind it does not scroll.
 *
 * It is charcoal over the light parts of the page and light over the dark ones.
 */
export function Menu() {
  const [open, setOpen] = useState(false)
  const [reach, setReach] = useState(false)
  const onDark = useOnDark(32)
  const root = useRef<HTMLElement>(null)
  const reaching = open && reach

  const close = () => {
    setOpen(false)
    setReach(false)
  }

  useEffect(() => {
    if (!open) return
    const shut = () => {
      setOpen(false)
      setReach(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') shut()
    }
    const onPress = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) shut()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPress)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPress)
    }
  }, [open])

  // While the sheet is down, the wheel and the finger do not move the page behind it. If the sheet itself is taller
  // than the screen (a small phone), it scrolls instead.
  useEffect(() => {
    const host = root.current
    if (!reaching || !host) return
    const hold = (event: Event) => {
      if (host.scrollHeight <= host.clientHeight + 1) event.preventDefault()
    }
    host.addEventListener('wheel', hold, { passive: false })
    host.addEventListener('touchmove', hold, { passive: false })
    return () => {
      host.removeEventListener('wheel', hold)
      host.removeEventListener('touchmove', hold)
    }
  }, [reaching])

  return (
    <header
      ref={root}
      className="menu"
      data-open={open}
      data-contact={reaching}
      data-tone={onDark ? 'light' : 'dark'}
      data-lenis-prevent={reaching || undefined}
      style={{ '--count': sections.length } as CSSProperties}
    >
      <nav id="menu-links" className="menu-links" aria-label="Sections" inert={!open}>
        <ul>
          {sections.map((section, i) => (
            <li key={section.id} style={{ '--i': i } as CSSProperties}>
              {section.id === 'contact' ? (
                <button
                  type="button"
                  className="menu-link"
                  aria-expanded={reaching}
                  aria-controls="menu-contact"
                  data-on={reaching}
                  onClick={() => setReach(!reach)}
                >
                  {section.label}
                </button>
              ) : (
                <a className="menu-link" href={`#${section.id}`} onClick={close}>
                  {section.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div id="menu-contact" className="menu-contact" inert={!reaching}>
        <p className="menu-name">{hero.name}</p>
        <div className="menu-reach">
          <ul>
            {contact.map((way, i) => (
              <li key={way.kind} style={{ '--i': i } as CSSProperties}>
                <a href={way.href} {...(way.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
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
          <div className="menu-cv" style={{ '--i': contact.length } as CSSProperties}>
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

      <button
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
    </header>
  )
}
