import { useRef, type CSSProperties } from 'react'
import { work, workBySlug, type Work } from '../content/cases'
import { Ending } from './Ending'
import { firstSentence, two } from './fit'
import { ground, lookFor } from './look'
import { Pair } from './Pair'
import { Arrow, Label, Title } from './parts'
import { Roles } from './Roles'
import { useReveal } from './useReveal'

/** A challenge whose first sentence is longer than this is set a size smaller, so it stays a statement and does not become a wall of display type. */
const LONG = 60

/**
 * One case study: the page at /work/<slug>. Every project is made of the
 * same parts in the same order (the top with its name, the facts at a
 * glance, the overview, the challenge, what he built, the engineering
 * notes, where it stands, the way out); look.ts
 * says which variant of each part this project gets. All the words come from
 * cases.ts (and the card in work.ts), and a value that is not known there is simply not shown.
 */
export function Case({ item }: { item: Work }) {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)

  const look = lookFor(item.slug)
  const next = workBySlug(item.next)
  const other = look.pair ? workBySlug(look.pair.with) : undefined

  // The contributions that are roles go into the diagram; the list under it holds the others.
  const roles = (look.roles ?? []).map((title) => {
    const found = item.contributions.find((entry) => entry.title === title)
    if (!found) throw new Error(`look.ts: ${item.slug} names a role "${title}" that is not a contribution in cases.ts.`)
    return found
  })
  const built = item.contributions.filter((entry) => !roles.includes(entry))
  // Cells stand two or three across, whichever leaves no cell empty at the end.
  const cols = built.length % 3 !== 0 && built.length % 2 === 0 ? 2 : 3

  const facts = [
    { label: 'Role', lines: item.role.split(' · ') },
    { label: 'Type', lines: [item.type] },
    { label: 'Stage', lines: item.status.split(' · ') },
    ...(item.year ? [{ label: 'Year', lines: [item.year] }] : []),
    ...(item.stack.length ? [{ label: 'Stack', lines: [item.stack.join(', ')] }] : []),
  ]
  const [lead, more] = firstSentence(item.overview)
  const [claim, why] = firstSentence(item.challenge)
  const stages = [
    { label: 'Now', text: item.evidence.now },
    ...(item.evidence.next ? [{ label: 'Next', text: item.evidence.next }] : []),
    ...(item.evidence.later ? [{ label: 'Later', text: item.evidence.later }] : []),
  ]

  // The sections number themselves, so a part that is left out leaves no gap in the count.
  let count = 0
  const pair = look.pair && other ? <Pair item={item} other={other} here={look.pair.here} there={look.pair.there} /> : null

  return (
    <div ref={root} className="case" data-project={item.slug}>
      <main id="top">
      <section className="case-hero" {...ground(look.hero)}>
        <div className="case-hero-head">
          <div className="case-lines" aria-hidden>
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="case-hero-rule">
            <p className="case-eyebrow">{item.eyebrow}</p>
            <a className="case-domain" href={item.site.url} target="_blank" rel="noopener noreferrer">
              {item.site.domain}
              <Arrow />
              <span className="case-sr"> (opens in a new tab)</span>
            </a>
          </div>
          <Title text={item.title} className="case-title" />
          <p className="case-subtitle">{item.subtitle}</p>
        </div>
      </section>

      <section className="case-glance" aria-labelledby="case-glance">
        <h2 id="case-glance" className="case-sr">
          At a glance
        </h2>
        <dl style={{ '--n': facts.length } as CSSProperties}>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>
                {fact.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="case-block case-overview" data-reading={look.reading}>
        <Label n={++count}>Overview</Label>
        <p className="case-lead" data-reveal="up">
          {lead}
        </p>
        {more ? (
          <p className="case-body" data-reveal="up">
            {more}
          </p>
        ) : null}
      </section>

      <section className="case-block case-challenge" {...ground(look.challenge)}>
        <Label n={++count}>The challenge</Label>
        <p className="case-statement" data-long={claim.length > LONG ? '' : undefined} data-reveal="up">
          {claim}
        </p>
        {why ? (
          <p className="case-why" data-reveal="up">
            {why}
          </p>
        ) : null}
      </section>

      {look.pair?.place === 'top' ? pair : null}

      <section className="case-block case-built" data-built={look.built} {...ground(look.builtOn)}>
        <Label n={++count}>What I built</Label>
        {roles.length ? <Roles roles={roles} /> : null}
        <ol className={look.built === 'cells' ? 'case-cells' : 'case-rows'} data-cols={look.built === 'cells' ? cols : undefined}>
          {built.map((entry, i) => (
            <li key={entry.title} data-reveal="up" style={{ '--d': i % 3 } as CSSProperties}>
              <span className="case-n" aria-hidden>
                {two(i + 1)}
              </span>
              <h3>{entry.title}</h3>
              <p>{entry.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="case-block case-notes">
        <Label n={++count}>Engineering notes</Label>
        <p className="case-lead" data-reveal="up">
          {item.engineeringNote}
        </p>
      </section>

      <section className="case-block case-status">
        <Label n={++count}>Status</Label>
        <dl className="case-stages" style={{ '--n': stages.length } as CSSProperties}>
          {stages.map((stage, i) => (
            <div key={stage.label} data-reveal="up" style={{ '--d': i } as CSSProperties}>
              <dt>{stage.label}</dt>
              <dd>{stage.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {look.pair?.place === 'status' ? pair : null}

      <section className="case-block case-visit">
        <Label n={++count}>Live</Label>
        <p className="case-visit-line" data-reveal="up">
          <a className="case-wipe" href={item.site.url} target="_blank" rel="noopener noreferrer">
            <span>{item.cta.visit}</span>
            <Arrow />
            <span className="case-sr"> (opens in a new tab)</span>
          </a>
        </p>
        <p className="case-visit-where" data-reveal="up">
          {item.site.domain}
        </p>
      </section>

      </main>

      {next ? <Ending next={next} total={work.length} /> : null}
    </div>
  )
}
