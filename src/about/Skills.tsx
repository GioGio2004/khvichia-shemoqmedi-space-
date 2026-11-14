import { useRef, type CSSProperties } from 'react'
import { skills } from '../content/skills'
import { useScrollFrame } from '../lib/useScrollFrame'

/**
 * The first card of the stack, in charcoal, carrying on from the opening's
 * bottom strip. It behaves like the other cards: it fills the screen, stays
 * while the page scrolls on, and the next card comes up over it and leaves
 * its strip showing.
 *
 * It says "Skills." (with the orange full stop), and under it two blocks
 * step down across the page: an orange one from the left edge to the first
 * column line, and a white one from that line to the right edge. The blocks
 * draw themselves in as the card comes up (--run, 0..1 as it passes; it
 * stops at 0.5 once the card is held).
 */
export function SkillsCard({ count }: { count: string }) {
  const root = useRef<HTMLElement>(null)

  useScrollFrame(() => {
    const element = root.current
    if (!element) return
    const box = element.getBoundingClientRect()
    const vh = window.innerHeight
    if (box.bottom < 0 || box.top > vh) return
    element.style.setProperty('--run', ((vh - box.top) / (vh + box.height)).toFixed(4))
  })

  return (
    <article ref={root} className="stack-card skills" data-tone="ink" data-theme="dark" style={{ '--i': 0 } as CSSProperties}>
      <header className="stack-strip">
        <span>{count}</span>
        <h3>{skills.title}</h3>
      </header>
      <div className="skills-body">
        <p className="skills-title" aria-hidden>
          {skills.title}
          <b>.</b>
        </p>
        <p className="skills-steps">
          <span data-tone="accent">{skills.steps[0]}</span> <span data-tone="paper">{skills.steps[1]}</span>
        </p>
      </div>
    </article>
  )
}
