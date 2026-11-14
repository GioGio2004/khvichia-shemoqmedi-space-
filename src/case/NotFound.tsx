import { work } from '../content/work'
import { two } from './fit'
import { Arrow, Title } from './parts'

/**
 * The page for an address that leads nowhere: it says so in the site's own
 * voice and offers the ways on, the home page and the four case studies.
 */
export function NotFound() {
  return (
    <main id="top" className="case case-missing" data-ground="ink" data-theme="dark">
      <div className="case-hero-rule">
        <p className="case-eyebrow">Error 404</p>
      </div>
      <Title text="Not found" className="case-title" />
      <p className="case-subtitle">This address does not lead anywhere on this site.</p>
      <nav className="case-missing-ways" aria-label="Ways on">
        <a className="case-wipe" href="/">
          <span>Home</span>
          <Arrow to="on" />
        </a>
        <ul>
          {work.map((item) => (
            <li key={item.slug}>
              <a href={`/work/${item.slug}`}>
                <span aria-hidden>{two(item.index)}</span>
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  )
}
