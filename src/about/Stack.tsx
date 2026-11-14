import { Fragment, useState, type CSSProperties } from 'react'
import { stack, type Group, type Tool } from '../content/stack'
import { work } from '../content/work'
import { SkillsCard } from './Skills'

const two = (n: number) => String(n).padStart(2, '0')

/** What the foot of a card says about a tool: the projects that use it, or its own note if none of the four do. */
function evidence(tool: Tool) {
  if (!tool.usedIn.length) return tool.note
  const names = tool.usedIn.length === work.length ? 'all four projects' : tool.usedIn.map((slug) => work.find((item) => item.slug === slug)?.title ?? slug).join(', ')
  return `${tool.name} · ${names}`
}

/** The ways a name answers the pointer. Each name gets the next one in turn, so neighbours never behave alike. */
const EFFECTS = ['block', 'outline', 'lean', 'wide', 'under', 'flip'] as const

/** `index` is the card's number among the groups (0 first); it sits one place lower in the stack, under the skills card. */
function Card({ group, index }: { group: Group; index: number }) {
  /** The name being pointed at, if any: its note takes the place of the card's own line. */
  const [pointed, setPointed] = useState<number | null>(null)

  return (
    <article className="stack-card" data-tone={group.tone} style={{ '--i': index + 1 } as CSSProperties}>
      <header className="stack-strip">
        <span>
          {two(index + 1)} / {two(stack.length)}
        </span>
        <h3>{group.title}</h3>
      </header>

      <ul className="stack-names">
        {group.tools.map((tool, i) => (
          <li key={tool.name}>
            <button
              type="button"
              data-fx={EFFECTS[(i + index * 2) % EFFECTS.length]}
              data-on={pointed === i}
              onPointerEnter={() => setPointed(i)}
              onPointerLeave={(event) => {
                // A finger has no way to leave, so a tapped name stays until another is tapped.
                if (event.pointerType === 'mouse') setPointed(null)
              }}
              onFocus={() => setPointed(i)}
              onBlur={() => setPointed(null)}
              aria-describedby={`stack-note-${index}`}
            >
              <span>{tool.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <footer className="stack-foot">
        <p id={`stack-note-${index}`} key={pointed ?? 'blurb'} aria-live="polite">
          {pointed === null ? group.blurb : evidence(group.tools[pointed])}
        </p>
        <span>{two(group.tools.length)} tools</span>
      </footer>
    </article>
  )
}

/**
 * About him: what he builds with. Full-screen cards that stack like
 * terraces: each card comes up over the one before it and stops a strip
 * lower, so the strips of the earlier cards stay in view as steps. First a
 * charcoal card that only says "Skills" (see Skills.tsx), then three cards
 * of names in the site's three colours (orange, charcoal, white).
 *
 * A card is a wall of names in very large type. Pointing at a name (or
 * tabbing to it) makes it react, each in its own way, lets the others step
 * back, and names the projects that use it at the foot of the card.
 */
export function Stack() {
  return (
    <section id="skills" className="stack">
      <h2 className="sr-only">Skills, stack and experience</h2>
      <SkillsCard count={`00 / ${two(stack.length)}`} />
      <div className="stack-hold" aria-hidden />
      {stack.map((group, i) => (
        <Fragment key={group.title}>
          <Card group={group} index={i} />
          {/* Empty room after each card: scrolling through it holds the card in full view before the next one comes up. */}
          <div className="stack-hold" aria-hidden />
        </Fragment>
      ))}
    </section>
  )
}
