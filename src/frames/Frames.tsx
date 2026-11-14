import { useEffect, useRef, type CSSProperties } from 'react'
import { road as frames } from '../content/road'
import { useScrollFrame } from '../lib/useScrollFrame'

const two = (n: number) => String(n).padStart(2, '0')

/** How the section spends its scrolling, in screen heights. */
const INTRO = 0.9 // the headline shrinks into its corner and the first photo opens
const STEP = 0.62 // scrolling this far brings the next photo
const REST = 0.55 // a moment on the last photo

/** Where each photo gives up the frame to the next one. A photo with a `stay` holds it that much longer. */
const ends: number[] = []
frames.forEach((photo, i) => {
  ends.push((i === 0 ? INTRO + STEP / 2 : ends[i - 1] + STEP) + (photo.stay ?? 0))
})
const length = ends[frames.length - 2] + STEP / 2 + REST

/** How quickly the row catches up with the photo whose turn it is (higher = snappier). */
const PULL = 13

const clamp = (x: number) => Math.min(Math.max(x, 0), 1)
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * The side scroll: scrolling down steps through a row of photos. The one in
 * turn fills the tall frame in the middle of the screen; the others wait as
 * small photos on either side, with a gap between them and around the frame.
 * The ones still to come are blurred; a photo comes into focus as it enters
 * the frame and stays sharp afterwards. The photos keep their own colours.
 *
 * It moves in steps: the page decides whose turn it is, and the row is
 * pulled there like a weight on a spring. So it snaps over, but however fast
 * the page is scrolled (several photos at once, or back and forth) the row
 * keeps one smooth movement and never jumps or stutters.
 *
 * Every photo has a comment that comes up beside the frame while the photo
 * is in it, by turns on the left and on the right. One photo is a guest (the
 * `cameo` in the list): the page stops on it a little longer, and its
 * comment comes in beats and ends with its name, large and in orange.
 *
 * After the last photo the footer takes the photos over (see handoff.ts):
 * they leave the row, line up, and become the letters of the closing word.
 *
 * The section is several screens tall and its stage stays in view the whole
 * way. The script only writes a few things; the stylesheet does the rest:
 *   on the stage   --open (0..1, the opening), --index (whose turn it is),
 *                  --pos (where the row is right now, between photos while it
 *                  moves), data-cameo while the guest is in the frame
 *   on each small photo   --d (how many places it is from the frame)
 *   on each comment       data-on while its photo is in the frame
 */
export function Frames() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const items = useRef<(HTMLLIElement | null)[]>([])
  const notes = useRef<(HTMLDivElement | null)[]>([])
  const shown = useRef(-1)
  /** The row: where it is, how fast it is moving, where it is going, and the running animation frame (0 = at rest). */
  const row = useRef({ at: 0, speed: 0, goal: 0, frame: 0, time: 0 })

  useScrollFrame(() => {
    const element = section.current
    const target = stage.current
    if (!element || !target) return
    const vh = window.innerHeight
    const box = element.getBoundingClientRect()
    if (shown.current >= 0 && (box.bottom < -vh || box.top > vh * 2)) return
    // Screen heights scrolled since the section reached the top, and a head start while it is still coming up.
    const t = clamp(-box.top / Math.max(box.height - vh, 1)) * length
    const arriving = clamp(1 - box.top / vh)

    target.style.setProperty('--arrive', arriving.toFixed(4))
    target.style.setProperty('--open', ease(clamp(t / INTRO)).toFixed(4))

    // Whose turn it is.
    let index = 0
    while (index < frames.length - 1 && t >= ends[index]) index++
    if (index === shown.current) return
    const first = shown.current < 0
    shown.current = index
    target.style.setProperty('--index', String(index))
    target.toggleAttribute('data-cameo', Boolean(frames[index].cameo))
    notes.current.forEach((note, i) => {
      note?.toggleAttribute('data-on', i === index)
      note?.toggleAttribute('inert', i !== index)
    })
    if (count.current) count.current.textContent = two(index + 1)

    // Puts the row somewhere: every small photo learns how far it is from the frame.
    const place = (at: number) => {
      target.style.setProperty('--pos', at.toFixed(4))
      items.current.forEach((item, i) => item?.style.setProperty('--d', (i - at).toFixed(4)))
    }
    const state = row.current
    state.goal = index
    if (first || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cancelAnimationFrame(state.frame)
      state.frame = 0
      state.at = index
      state.speed = 0
      place(index)
      return
    }
    // Pulled towards its goal like a weight on a spring that never overshoots. A new goal mid-way just bends the same movement.
    const pull = (now: number) => {
      // Worked out in small steps of time, so it takes just as long on a slow screen as on a fast one.
      let left = Math.min(Math.max((now - state.time) / 1000, 0), 0.15)
      state.time = now
      while (left > 0) {
        const dt = Math.min(left, 1 / 120)
        state.speed += (PULL * PULL * (state.goal - state.at) - 2 * PULL * state.speed) * dt
        state.at += state.speed * dt
        left -= dt
      }
      const there = Math.abs(state.goal - state.at) < 0.0008 && Math.abs(state.speed) < 0.005
      if (there) {
        state.at = state.goal
        state.speed = 0
      }
      place(state.at)
      state.frame = there ? 0 : requestAnimationFrame(pull)
    }
    if (!state.frame) {
      state.time = performance.now()
      state.frame = requestAnimationFrame(pull)
    }
  })

  useEffect(() => {
    const state = row.current
    return () => cancelAnimationFrame(state.frame)
  }, [])

  return (
    <section
      ref={section}
      id="frames"
      className="frames"
      data-theme="dark"
      style={{ height: `calc(${(length + 1).toFixed(2)} * 100svh)` }}
    >
      <h2 className="sr-only">Along the way: a few frames</h2>
      <div ref={stage} className="frames-stage" style={{ '--n': frames.length } as CSSProperties}>
        <p className="frames-title" aria-hidden>
          <small>Along the way,</small>
          <span>a few frames</span>
        </p>

        {/* The row of small photos. */}
        <ul className="frames-row" aria-hidden>
          {frames.map((photo, i) => (
            <li
              key={photo.slug}
              ref={(item) => {
                items.current[i] = item
              }}
              style={{ '--d': i } as CSSProperties}
            >
              <img
                src={photo.colour}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                style={{ objectPosition: `${photo.focus[0] * 100}% ${photo.focus[1] * 100}%` }}
              />
            </li>
          ))}
        </ul>

        {/* The frame: the same photos, large, each sliding in as its turn comes. */}
        <div className="frames-frame" aria-hidden>
          <div className="frames-large">
            {frames.map((photo) => (
              <img
                key={photo.slug}
                src={photo.colour}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                style={{ objectPosition: `${photo.focus[0] * 100}% ${photo.focus[1] * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* The comments, one per photo, by turns left and right of the frame. */}
        {frames.map((photo, i) => (
          <div
            key={photo.slug}
            ref={(note) => {
              notes.current[i] = note
            }}
            className="frames-note"
            data-side={i % 2 === 0 ? 'left' : 'right'}
            data-big={photo.cameo ? '' : undefined}
          >
            <small>
              [ {two(i + 1)}
              {photo.cameo ? ` // ${photo.cameo.tag}` : ''} ]
            </small>
            {photo.cameo ? (
              <>
                <p className="frames-lead">{photo.cameo.lead}</p>
                <p className="frames-bridge">{photo.cameo.bridge}</p>
                <strong>
                  {photo.cameo.name.map((line, n, all) => (
                    <span key={line}>
                      {line}
                      {n === all.length - 1 ? <b>.</b> : null}
                    </span>
                  ))}
                </strong>
              </>
            ) : photo.link ? (
              <p>
                <a href={photo.link} target="_blank" rel="noreferrer">
                  {photo.note}
                  <i aria-hidden> ↗</i>
                </a>
              </p>
            ) : (
              <p>{photo.note}</p>
            )}
          </div>
        ))}

        <p className="frames-count" aria-hidden>
          <span ref={count}>01</span> / {two(frames.length)}
        </p>
      </div>
    </section>
  )
}
