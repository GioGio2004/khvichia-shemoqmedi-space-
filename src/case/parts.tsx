import { Fragment, type CSSProperties, type ReactNode } from 'react'
import { ems, two, widestWord } from './fit'

/**
 * A name set very large, ending on the orange full stop. Each word is a
 * window and its letters rise into it one after another, like the name on
 * the home page. Screen readers get the plain text (the label on the
 * element); the single letters are hidden from them.
 *
 * `--fit` and `--fit-word` tell the stylesheet how wide the name is (see
 * fit.ts), so it can size it to the page.
 */
export function Title({ text, as: Tag = 'h1', className }: { text: string; as?: 'h1' | 'p'; className: string }) {
  const full = `${text}.`
  const words = text.split(' ').map((word, i, all) => ({
    letters: [...word],
    start: all.slice(0, i).join('').length,
    last: i === all.length - 1,
  }))
  return (
    <Tag className={className} style={{ '--fit': ems(full).toFixed(2), '--fit-word': widestWord(full).toFixed(2) } as CSSProperties}>
      <span className="case-sr">{text}</span>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span className="case-word" aria-hidden>
            {word.letters.map((char, i) => (
              <span key={i} style={{ '--c': word.start + i } as CSSProperties}>
                {char}
              </span>
            ))}
            {word.last ? <b style={{ '--c': word.start + word.letters.length } as CSSProperties}>.</b> : null}
          </span>
          {word.last ? null : ' '}
        </Fragment>
      ))}
    </Tag>
  )
}

/** A small drawn arrow: up and to the right for a link that leaves the site, right for one that stays, down for a file. */
export function Arrow({ to = 'out' }: { to?: 'out' | 'on' | 'down' | 'back' }) {
  return (
    <svg className="case-arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden>
      {to === 'out' ? <path d="M2.5 9.5l7-7M4 2.5h5.5V8" /> : null}
      {to === 'on' ? <path d="M1.5 6h9M6.5 2l4 4-4 4" /> : null}
      {to === 'back' ? <path d="M10.5 6h-9M5.5 2l-4 4 4 4" /> : null}
      {to === 'down' ? <path d="M6 1.5v9M2 6.5l4 4 4-4" /> : null}
    </svg>
  )
}

/** The small numbered heading at the start of a section. */
export function Label({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="case-label">
      <span aria-hidden>{two(n)}</span>
      {children}
    </h2>
  )
}
