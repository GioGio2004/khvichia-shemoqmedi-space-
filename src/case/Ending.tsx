import { contact, cv } from '../content/contact'
import { hero } from '../content/hero'
import type { Work } from '../content/cases'
import { two } from './fit'
import { Arrow, Title } from './parts'

const year = new Date().getFullYear()
const mail = contact.find((way) => way.kind === 'email')

/**
 * The end of a case study. First the next project: a band as wide as the
 * screen that names it very large and is one link to it; pointing at it
 * wipes a slab of orange across, the way the skill names answer the pointer
 * on the home page. Under it a short strip with the three things a visitor
 * may want now: write to him, take his CV, or go back to all the work.
 */
export function Ending({ next, total }: { next: Work; total: number }) {
  return (
    <footer className="case-ending" data-theme="dark">
      <a className="case-next" href={`/work/${next.slug}`} data-reveal="next">
        <span className="case-next-top">
          <span>Next project</span>
          <span>
            {two(next.index)} / {two(total)}
          </span>
        </span>
        <Title as="p" text={next.title} className="case-next-title" />
        <span className="case-next-foot">
          <span>{next.eyebrow}</span>
          <Arrow to="on" />
        </span>
      </a>

      <div className="case-reach">
        <h2 className="case-reach-label">Contact</h2>
        <ul>
          {mail ? (
            <li>
              <a className="case-wipe" href={mail.href}>
                <span>Email me</span>
                <Arrow to="on" />
              </a>
              <small>{mail.text}</small>
            </li>
          ) : null}
          <li>
            <a className="case-wipe" href={cv.file} download>
              <span>Download CV</span>
              <Arrow to="down" />
            </a>
            <small>
              <a href={cv.other.file} download hrefLang="ka" aria-label={`Download CV, ${cv.other.label}`}>
                {cv.other.label}
              </a>
            </small>
          </li>
          <li>
            <a className="case-wipe" href="/#work">
              <span>Explore work</span>
              <Arrow to="on" />
            </a>
          </li>
        </ul>
        <p className="case-reach-line">
          <span>
            {/* The year is written when the site is built. If the browser's own year is later, the built one stays until the next build. */}
            © <span suppressHydrationWarning>{year}</span> {hero.name}
          </span>
          <a href="#top">Back to top</a>
        </p>
      </div>
    </footer>
  )
}
