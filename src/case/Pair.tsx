import type { CSSProperties } from 'react'
import type { Work } from '../content/cases'
import { Arrow } from './parts'

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
