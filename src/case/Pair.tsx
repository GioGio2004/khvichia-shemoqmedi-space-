import type { CSSProperties } from 'react'
import type { Work } from '../content/work'
import { Arrow, Shot } from './parts'

const SIZES = '(min-width: 761px) 50vw, 100vw'

/**
 * The picture of one half: the picture at the top of its own page when it has one, otherwise the first screen of the
 * site as the home page's gallery shows it. Here it is decoration: the words under each half name it, so it carries
 * no description of its own (a screen reader would otherwise hear the same description twice on one page, and the
 * link's name would start with it).
 */
function Face({ item }: { item: Work }) {
  const hero = item.pictures.find((entry) => entry.name === item.media.hero)
  if (hero) return <Shot slug={item.slug} picture={{ ...hero, caption: undefined, alt: '' }} sizes={SIZES} reveal={false} />
  return (
    <figure className="case-shot" data-kind="desktop">
      <div className="case-shot-frame">
        <img src={item.site.shot} width={1440} height={900} alt="" loading="lazy" decoding="async" />
      </div>
    </figure>
  )
}

/**
 * "Two deliverables, one client": the two Kencho projects side by side. The
 * page being read is on the left and is marked as such; the other half is on
 * the right and is one large link to its case study. Each of the two pages
 * shows this block, mirrored.
 */
export function Pair({ item, other, here, there }: { item: Work; other: Work; here: string; there: string }) {
  return (
    <section className="case-pair" aria-labelledby="case-pair" data-ground="ink" data-theme="dark">
      <h2 id="case-pair" className="case-pair-title" data-reveal="up">
        Two deliverables, one client.
      </h2>
      <div className="case-pair-halves">
        <div className="case-half" data-reveal="up">
          <Face item={item} />
          <p className="case-half-kind">
            <span>{here}</span>
            <span>{item.site.domain}</span>
          </p>
          <p className="case-half-name">{item.title}</p>
          <p className="case-half-go" data-here>
            This page
          </p>
        </div>
        <a className="case-half" href={`/work/${other.slug}`} data-reveal="up" style={{ '--d': 1 } as CSSProperties}>
          <Face item={other} />
          <span className="case-half-kind">
            <span>{there}</span>
            <span>{other.site.domain}</span>
          </span>
          <span className="case-half-name">{other.title}</span>
          <span className="case-half-go">
            Read the case study
            <Arrow to="on" />
          </span>
        </a>
      </div>
    </section>
  )
}
