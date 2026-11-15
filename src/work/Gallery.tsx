import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type RefObject } from 'react'
import { LinearFilter, LinearMipmapLinearFilter, NoColorSpace, TextureLoader, Vector2, type Mesh, type ShaderMaterial, type Texture } from 'three'
import type { Site } from '../content/sites'
import { openWindow } from './layout'
import { fragmentShader, vertexShader } from './shader'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** The screen in the middle of a panel is this shape (width / height), the shape of the pictures. */
const SCREEN = 1.6
/** Left alone, the row moves on to the next panel after this long (milliseconds). */
const TURN = 5500
/** How long a panel takes to open flat, or to fold back (seconds). */
const UNFOLD = 0.9

/** Sizes of the row, in the scene's own units, for a screen that is `vw` wide and `vh` tall. */
function measure(vw: number, vh: number, narrow: boolean) {
  const cardH = narrow ? Math.min(vh * 0.5, vw * 0.9) : vh * 0.56
  const cardW = narrow ? vw * 0.8 : Math.min(vw * 0.6, cardH * 1.75)
  // The screen takes most of the panel's height, or most of its width on a narrow panel.
  const insetW = Math.min((0.66 * SCREEN * cardH) / cardW, 0.8)
  return {
    cardW,
    cardH,
    inset: [insetW, (insetW * cardW) / cardH / SCREEN] as const,
    step: cardW + vw * (narrow ? 0.05 : 0.035),
    // A tighter curve than the screen is wide, so the ends of the row swing towards the viewer.
    radius: vw * (narrow ? 0.6 : 0.7),
  }
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** What the page's own buttons can ask of the row. */
export type GalleryApi = {
  /** Move on by this many projects (1 = next, -1 = previous). */
  step: (by: number) => void
}

type RowProps = {
  sites: Site[]
  /** The element that receives the dragging, the clicks, the arrow keys and the sideways scrolling. */
  stage: RefObject<HTMLDivElement | null>
  inView: boolean
  /** Whether the panel in the middle is opened (flat, showing the site). */
  open: boolean
  /** The project the row starts on. */
  initial: number
  /** Filled in here, for the page's previous and next buttons. */
  api: RefObject<GalleryApi | null>
  /** True while the row must not move on by itself (the keyboard is in the section, or the pointer is on its buttons). */
  paused: RefObject<boolean>
  /** Told whenever another project comes to the middle, and whether a person moved it there (not the row by itself). */
  onActive: (index: number, byPerson: boolean) => void
  /** The screen of the middle panel was clicked. */
  onOpen: () => void
  /** Told as the middle panel opens and folds back: 0 = bent in the row, 1 = flat. */
  onFlat: (flat: number) => void
  /** Told once, when every picture is on the graphics card and the drawing is prepared: the first frame will not stall. */
  onReady?: () => void
}

function Row({ sites, stage, inView, open, initial, api, paused, onActive, onOpen, onFlat, onReady }: RowProps) {
  // The row loops for ever, so a short list is repeated until it is longer than the screen.
  const slots = useMemo(() => {
    const list: number[] = []
    while (list.length < 6) sites.forEach((_, i) => list.push(i))
    return list
  }, [sites])

  const materials = useMemo(
    () =>
      slots.map(() => ({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        uniforms: {
          uShot: { value: null as Texture | null },
          uShotAspect: { value: SCREEN },
          uSize: { value: new Vector2(1, 1) },
          uShape: { value: new Vector2(1, 1) },
          uInset: { value: new Vector2(0.6, 0.6) },
          uOffset: { value: 0 },
          uRadius: { value: 1 },
          uPush: { value: 0 },
          uLift: { value: 0 },
          uEnd: { value: 0.5 },
          uLens: { value: 0 },
          uFlat: { value: 0 },
          uFlatSize: { value: new Vector2(1, 1) },
          uFlatCenter: { value: new Vector2(0, 0) },
          uCorner: { value: 0 },
          uSplit: { value: 0 },
          uOpacity: { value: 0 },
        },
      })),
    [slots],
  )

  // The pictures of the sites, loaded one by one. A panel stays away until its picture arrives.
  const [shots, setShots] = useState<(Texture | null)[]>([])
  useEffect(() => {
    let alive = true
    const loaded: Texture[] = []
    const loader = new TextureLoader()
    sites.forEach((site, i) => {
      loader.load(site.shot, (texture) => {
        if (!alive) return texture.dispose()
        texture.colorSpace = NoColorSpace
        texture.minFilter = LinearMipmapLinearFilter
        texture.magFilter = LinearFilter
        texture.anisotropy = 8
        loaded.push(texture)
        setShots((current) => {
          const next = [...current]
          next[i] = texture
          return next
        })
      })
    })
    return () => {
      alive = false
      loaded.forEach((texture) => texture.dispose())
    }
  }, [sites])

  // Once every picture has arrived: they are sent to the graphics card and the drawing program is prepared now, while
  // the opening screen is still up, instead of on the first frame the gallery is seen.
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const prepared = useRef(false)
  useEffect(() => {
    if (prepared.current || shots.filter(Boolean).length < sites.length) return
    prepared.current = true
    for (const texture of shots) if (texture) gl.initTexture(texture)
    gl.compile(scene, camera)
    onReady?.()
  }, [shots, sites, gl, scene, camera, onReady])

  const meshes = useRef<(Mesh | null)[]>([])
  /** Positions are counted in panels: 0 is the first panel in the middle, 1 the second, and so on. */
  const motion = useRef({ target: initial, current: initial, previous: initial, speed: 0, dragging: false, pointer: -1, startX: 0, startY: 0, startTarget: 0, lastX: 0, lastT: 0, toss: 0, moved: 0 })
  /** Things the pointer handlers need that are only known while drawing: refreshed every frame. */
  const live = useRef({ panelsPerPixel: 0, screenW: 0, screenH: 0, centerY: 0, flat: 0, hover: false, touched: 0, byItself: false })
  const introAt = useRef<number | null>(null)
  const active = useRef(-1)
  const unfold = useRef(0)
  const wantOpen = useRef(open)
  const told = useRef(-1)

  // The page's previous and next buttons.
  useImperativeHandle(
    api,
    () => ({
      step: (by) => {
        if (live.current.flat > 0) return
        live.current.touched = performance.now()
        live.current.byItself = false
        motion.current.target = Math.round(motion.current.target) + by
      },
    }),
    [],
  )

  useEffect(() => {
    wantOpen.current = open
    // Coming back from an opened panel, the row waits a full turn before it moves on by itself.
    live.current.touched = performance.now()
  }, [open])

  useEffect(() => {
    if (inView && introAt.current === null) introAt.current = performance.now()
    live.current.touched = performance.now()
  }, [inView])

  useEffect(() => {
    const element = stage.current
    if (!element) return
    const m = motion.current
    const l = live.current
    let settle = 0

    /** Is this point on the screen of the panel in the middle? */
    const onScreen = (event: PointerEvent) => {
      const box = element.getBoundingClientRect()
      return Math.abs(event.clientX - box.left - box.width / 2) < l.screenW / 2 && Math.abs(event.clientY - box.top - l.centerY) < l.screenH / 2
    }

    const down = (event: PointerEvent) => {
      if (l.flat > 0 || (event.pointerType === 'mouse' && event.button !== 0)) return
      m.dragging = true
      m.pointer = event.pointerId
      m.startX = m.lastX = event.clientX
      m.startY = event.clientY
      m.startTarget = m.target
      m.lastT = event.timeStamp
      m.toss = 0
      m.moved = 0
      l.byItself = false
      l.touched = performance.now()
      element.setPointerCapture(event.pointerId)
      element.dataset.dragging = 'true'
    }
    const move = (event: PointerEvent) => {
      if (!m.dragging) {
        // Not dragging: show whether a click here would open the panel. While the mouse rests on that screen the row does not move on by itself.
        if (event.pointerType === 'mouse') {
          const over = l.flat === 0 && onScreen(event)
          if (over !== l.hover) l.touched = performance.now()
          l.hover = over
          element.dataset.over = over ? 'screen' : ''
        }
        return
      }
      if (event.pointerId !== m.pointer) return
      m.moved = Math.max(m.moved, Math.abs(event.clientX - m.startX), Math.abs(event.clientY - m.startY))
      m.target = m.startTarget - (event.clientX - m.startX) * l.panelsPerPixel * 1.25
      const dt = (event.timeStamp - m.lastT) / 1000
      if (dt > 0) m.toss += ((-(event.clientX - m.lastX) * l.panelsPerPixel) / dt - m.toss) * 0.5
      m.lastX = event.clientX
      m.lastT = event.timeStamp
    }
    const up = (event: PointerEvent) => {
      if (!m.dragging || event.pointerId !== m.pointer) return
      m.dragging = false
      delete element.dataset.dragging
      l.touched = performance.now()
      if (event.type === 'pointerup' && m.moved < 7) {
        // A click, not a drag: on the middle screen it opens the site; to either side it brings that panel in.
        m.target = Math.round(m.startTarget)
        if (onScreen(event)) onOpen()
        else {
          const box = element.getBoundingClientRect()
          const side = event.clientX - box.left - box.width / 2
          if (Math.abs(side) > l.screenW * 0.75) m.target += Math.sign(side)
        }
        return
      }
      // Let go while moving and the row carries on a little, then stops on a panel.
      const resting = event.timeStamp - m.lastT > 90
      m.target = Math.round(m.target + (resting ? 0 : m.toss * 0.22))
    }
    // The arrow keys move the row. Opening a project is left to the buttons under the row, each of which says what it opens.
    const key = (event: KeyboardEvent) => {
      if (l.flat > 0) return
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
      event.preventDefault()
      l.byItself = false
      l.touched = performance.now()
      m.target = Math.round(m.target) + (event.key === 'ArrowRight' ? 1 : -1)
    }
    // Sideways scrolling (a trackpad swipe) moves the row too; up and down still scrolls the page.
    const wheel = (event: WheelEvent) => {
      if (l.flat > 0 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      l.byItself = false
      l.touched = performance.now()
      m.target += event.deltaX * l.panelsPerPixel
      clearTimeout(settle)
      settle = window.setTimeout(() => (m.target = Math.round(m.target)), 140)
    }
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      l.hover = false
      element.dataset.over = ''
    }

    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', up)
    element.addEventListener('pointercancel', up)
    element.addEventListener('pointerleave', leave)
    element.addEventListener('keydown', key)
    element.addEventListener('wheel', wheel, { passive: false })
    return () => {
      clearTimeout(settle)
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', up)
      element.removeEventListener('pointercancel', up)
      element.removeEventListener('pointerleave', leave)
      element.removeEventListener('keydown', key)
      element.removeEventListener('wheel', wheel)
    }
  }, [stage, onOpen])

  const narrowNow = useThree((state) => state.size.width <= 760)

  useFrame((state, delta) => {
    const m = motion.current
    const l = live.current
    const vw = state.viewport.width
    const vh = state.viewport.height
    const unit = vw / state.size.width // scene units in one pixel
    const r = measure(vw, vh, narrowNow)
    const dt = Math.min(delta, 0.05) || 0.016
    const now = performance.now()

    // Opening and folding back.
    unfold.current = Math.min(Math.max(unfold.current + ((wantOpen.current ? 1 : -1) * dt) / (reducedMotion ? 0.01 : UNFOLD), 0), 1)
    const flat = inOut(unfold.current)
    l.flat = flat
    if (flat !== told.current) {
      told.current = flat
      onFlat(flat)
    }

    // Left alone, the row moves on by itself. Not while somebody is using the section with the keyboard or its buttons.
    if (paused.current) l.touched = now
    if (!reducedMotion && inView && flat === 0 && !m.dragging && !l.hover && introAt.current !== null && now - l.touched > TURN) {
      l.touched = now
      l.byItself = true
      m.target = Math.round(m.target) + 1
    }

    m.current += (m.target - m.current) * (1 - Math.exp(-dt * (m.dragging ? 16 : 6)))
    m.speed += ((m.current - m.previous) / dt - m.speed) * (1 - Math.exp(-dt * 9))
    m.previous = m.current
    // Speed in screen widths per second, the unit the effects are tuned in.
    const speed = reducedMotion ? 0 : Math.min(Math.abs((m.speed * r.step) / vw), 3)

    // The entrance: the row slides in from the right and closes up.
    let enter = reducedMotion && introAt.current !== null ? 1 : 0
    if (!reducedMotion && introAt.current !== null) {
      const x = Math.min((now - introAt.current) / 1500, 1)
      enter = 1 - Math.pow(1 - x, 4)
    }

    // What the pointer handlers need to know, in pixels.
    l.panelsPerPixel = unit / r.step
    l.screenW = (r.cardW * r.inset[0]) / unit
    l.screenH = (r.cardH * r.inset[1]) / unit
    l.centerY = state.size.height / 2 + (vh * 0.03) / unit

    // The opened window, in scene units (the page lays the live site over the same rectangle).
    const win = openWindow(state.size.width, state.size.height)
    const flatW = win.width * unit
    const flatH = win.height * unit
    const flatY = (state.size.height / 2 - (win.top + win.height / 2)) * unit

    const count = slots.length
    slots.forEach((site, i) => {
      const mesh = meshes.current[i]
      if (!mesh) return
      const shot = shots[site]
      // Where the panel is, in panels from the middle of the screen, wrapped so the row never ends.
      let place = i - m.current
      place = ((((place + count / 2) % count) + count) % count) - count / 2
      const middle = Math.abs(place) < 0.5
      // The panel being opened flattens; the others move off to the sides and fade.
      const opening = middle ? flat : 0
      const aside = middle ? 0 : flat
      const x = place * r.step + (1 - enter) * vw * 0.7 * (1 + place * 0.3) + Math.sign(place) * aside * vw * 0.3
      mesh.visible = Boolean(shot) && Math.abs(x) < vw * 1.05
      if (!mesh.visible) return
      mesh.renderOrder = middle ? count : i

      const u = (mesh.material as ShaderMaterial).uniforms
      u.uShot.value = shot
      const image = shot!.image as { width: number; height: number }
      u.uShotAspect.value = image.width / image.height
      u.uSize.value.set(r.cardW, r.cardH)
      u.uShape.value.set(mix(r.cardW, flatW, opening), mix(r.cardH, flatH, opening))
      // Opened, the screen is the whole panel.
      u.uInset.value.set(mix(r.inset[0], 1, opening), mix(r.inset[1], 1, opening))
      u.uOffset.value = x
      u.uRadius.value = r.radius
      u.uPush.value = speed * vw * 0.035
      u.uLift.value = -vh * 0.03
      u.uEnd.value = Math.asin(Math.min((vw * 0.4) / r.radius, 1))
      // The pull into the corners; it grows while the row is moving.
      u.uLens.value = 0.2 + speed * 0.07
      u.uFlat.value = opening
      u.uFlatSize.value.set(flatW, flatH)
      u.uFlatCenter.value.set(0, flatY)
      u.uCorner.value = r.cardH * 0.018 * (1 - opening)
      u.uSplit.value = reducedMotion ? 0 : (0.0012 + speed * 0.006) * (1 - opening)
      u.uOpacity.value = enter * (1 - aside)
    })

    const index = slots[((Math.round(m.current) % count) + count) % count]
    if (index !== active.current) {
      // The very first report is the row arriving, not somebody moving it.
      const first = active.current === -1
      active.current = index
      onActive(index, !first && !l.byItself)
    }
  })

  return (
    <>
      {slots.map((_, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            meshes.current[i] = mesh
          }}
          frustumCulled={false}
          renderOrder={i}
        >
          <planeGeometry args={[1, 1, 48, 20]} />
          <shaderMaterial args={[materials[i]]} />
        </mesh>
      ))}
    </>
  )
}

/**
 * The work gallery: a row of bent panels on a curve. It is dragged left and
 * right, moves on by itself when left alone, and the panel in the middle
 * opens flat when its screen is clicked. The canvas only draws; the stage
 * element handles the input.
 */
export default function Gallery(props: RowProps) {
  return (
    <Canvas
      camera={{ fov: 40, position: [0, 0, 10], near: 0.1, far: 60 }}
      dpr={[1, 2]}
      frameloop={props.inView ? 'always' : 'never'}
      // Measured at once and never on scroll. By default the canvas waits until the page has stood still for 50 ms before it
      // takes its size, and draws nothing until then: mounted while the visitor is scrolling (as it always is here), it
      // would stay empty for as long as the page keeps moving.
      resize={{ scroll: false, debounce: 0 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Row {...props} />
    </Canvas>
  )
}
