import { useRef, type CSSProperties } from 'react'
import { work, workBySlug, type Picture, type Work } from '../content/work'
import { Ending } from './Ending'
import { firstSentence, two } from './fit'
import { ground, lookFor } from './look'
import { Pair } from './Pair'
import { Arrow, Label, Shot, Title } from './parts'
import { Roles } from './Roles'
import { useReveal } from './useReveal'

/** How wide each kind of picture is shown, for the browser's choice of file. */
const FULL = '100vw'
const WIDE = '(min-width: 901px) 75vw, 100vw'
const HALF = '(min-width: 761px) 50vw, 100vw'
const PHONE = '(min-width: 1101px) 25vw, (min-width: 761px) 50vw, 80vw'

/** A challenge whose first sentence is longer than this is set a size smaller, so it stays a statement and does not become a wall of display type. */
const LONG = 60

type Row = { kind: 'full' | 'pair' | 'phones'; pictures: Picture[] }

/**
 * Lays the pictures that are left over out as a sequence of rows. Desktop
 * pictures are large: edge to edge one after another when the project
 * `bleed`s, otherwise two by two with an odd one standing alone first. Phone
 * pictures share one row of narrow columns, placed after the first row so
 * the sizes alternate.
 */
function sequence(pictures: Picture[], bleed: boolean): Row[] {
  const desktops = pictures.filter((picture) => picture.kind === 'desktop')
  const phones = pictures.filter((picture) => picture.kind === 'mobile')
  const rows: Row[] = []
  let from = 0
  if (bleed || desktops.length % 2 === 1) rows.push({ kind: 'full', pictures: desktops.slice(0, ++from) })
  for (; from < desktops.length; from += bleed ? 1 : 2) {
    const group = desktops.slice(from, from + (bleed ? 1 : 2))
    rows.push({ kind: group.length === 2 ? 'pair' : 'full', pictures: group })
  }
  const phoneRows: Row[] = []
  for (let i = 0; i < phones.length; i += 4) phoneRows.push({ kind: 'phones', pictures: phones.slice(i, i + 4) })
  rows.splice(Math.min(1, rows.length), 0, ...phoneRows)
  return rows
}

/**
 * One case study: the page at /work/<slug>. Every project is made of the
 * same parts in the same order (the top with its name and picture, the
 * facts at a glance, the overview, the challenge, what he built, the
 * pictures, the engineering notes, where it stands, the way out); look.ts
 * says which variant of each part this project gets. All the words come from
 * work.ts, and a value that is not known there is simply not shown.
 */
export function Case({ item }: { item: Work }) {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)

  const look = lookFor(item.slug)
  const next = workBySlug(item.next)
  const other = look.pair ? workBySlug(look.pair.with) : undefined

  const picture = (name: string) => {
    const found = item.pictures.find((entry) => entry.name === name)
    if (!found) throw new Error(`work.ts: ${item.slug} uses a picture called "${name}" that is not in its pictures list.`)
    return found
  }
  const hero = item.media.hero ? picture(item.media.hero) : null
  // The same screen taken on a phone, when there is one: phones show the top of it instead of a desktop picture shrunk to a quarter.
  const heroPhone = hero ? item.pictures.find((entry) => entry.kind === 'mobile' && entry.name === `${hero.name}-mobile`) : undefined

  // The contributions that are roles go into the diagram; the list under it holds the others.
  const roles = (look.roles ?? []).map((title) => {
    const found = item.contributions.find((entry) => entry.title === title)
    if (!found) throw new Error(`look.ts: ${item.slug} names a role "${title}" that is not a contribution in work.ts.`)
    return found
  })
  const built = item.contributions.filter((entry) => !roles.includes(entry))
  // Cells stand two or three across, whichever leaves no cell empty at the end.
  const cols = built.length % 3 !== 0 && built.length % 2 === 0 ? 2 : 3

  // In the grid of cells a picture has no room beside its text, so those pictures lead the sequence instead, under the name of what they show.
  const shown = look.built === 'cells' ? item.contributions.filter((entry) => entry.media) : []
  const taken = new Set([item.media.hero, ...item.contributions.map((entry) => entry.media)])
  const rest = item.media.gallery.filter((name) => !taken.has(name)).map(picture)
  const labels = new Map(shown.map((entry) => [entry.media!, entry.title]))
  const rows = sequence([...shown.map((entry) => picture(entry.media!)), ...rest], look.bleed)

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
    <div ref={root} className="case" data-project={item.slug} data-bleed={look.bleed || undefined}>
      <main id="top">
      <section
        className="case-hero"
        {...ground(look.hero)}
        data-stage={hero && look.stage !== 'none' ? look.stage : undefined}
        data-phone={heroPhone ? '' : undefined}
      >
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
        {hero ? (
          <>
            {look.stage !== 'none' ? (
              <div className="case-stage" {...ground(look.stage)} style={{ '--ratio': hero.height / hero.width } as CSSProperties} aria-hidden />
            ) : null}
            <Shot slug={item.slug} picture={hero} phone={heroPhone} sizes={FULL} eager reveal={false} className="case-hero-shot" />
          </>
        ) : null}
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

      <section className="case-block case-built" data-built={look.built} {...ground(look.pictures)}>
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
              {entry.media && look.built === 'rows' ? (
                <Shot slug={item.slug} picture={picture(entry.media)} sizes={look.bleed ? FULL : WIDE} className="case-row-shot" />
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {rows.length ? (
        <section className="case-sequence" aria-label={`Pictures of ${item.title}`} {...ground(look.pictures)}>
          {rows.map((row, r) => (
            <div key={r} className="case-seq-row" data-row={row.kind} style={{ '--n': row.pictures.length } as CSSProperties}>
              {row.pictures.map((entry) => (
                <Shot
                  key={entry.name}
                  slug={item.slug}
                  picture={entry}
                  sizes={row.kind === 'full' ? FULL : row.kind === 'pair' ? HALF : PHONE}
                  label={labels.get(entry.name)}
                />
              ))}
            </div>
          ))}
        </section>
      ) : null}

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
