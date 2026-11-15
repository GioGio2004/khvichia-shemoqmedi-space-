import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import {
  CanvasTexture,
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
  TextureLoader,
  Vector2,
  type Mesh,
  type ShaderMaterial,
  type Texture,
} from 'three'
import { photoPlaces } from '../frames/handoff'
import { CUT, FLOOD, INK, PAUSE, SETTLE, scrollLength } from './timeline'

const FONT = 'Anton'
/** The two inks the photos are printed in once they are letters. */
const ACCENT = '#ff4d00'
const INK_COLOR = '#1c1c1c'

/** Height of a capital letter in the mask pictures, and the empty margin around it, in pixels. */
const CAP = 900
const PAD = 90

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Each sheet starts as a plain rectangular photo (the "tile"), exactly as it
// hung in the side scroll, and is then trimmed to its letter from the top
// down. The letter's mask is a slightly soft picture of it, cut at 50%, so
// the outline stays sharp at any size. At the end black rises into the letter
// from its foot. Everything here is measured in screen pixels from the middle
// of the sheet.
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uMask;
  uniform sampler2D uPhoto;
  uniform vec2 uMesh;       // the sheet's width and height
  uniform vec2 uTile;       // the photo's width and height
  uniform vec2 uSheet;      // the mask picture's width and height
  uniform float uLetter;    // the height of the letter
  uniform float uPhotoIn;   // 0 = plain colour, 1 = photo
  uniform float uAspect;    // the photo file's width / height
  uniform vec2 uFocus;      // which part of the photo stays in view when it is cropped (from its top left)
  uniform float uDim;       // 1 = as it is, lower = darker
  uniform float uTint;      // 0 = the photo's own colours, 1 = printed in the two inks
  uniform float uCut;       // how far the trimming has come down: 0 = whole photo, 1 = letter only
  uniform vec3 uAccent;
  uniform vec3 uInk;
  uniform float uInkLevel;  // how far the black has risen up the letter: 0 = none, 1 = to the top
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * uMesh;

    float mask = texture2D(uMask, p / uSheet + 0.5).r;
    float soft = max(fwidth(mask), 0.0001) * 0.75;
    float letter = smoothstep(0.5 - soft, 0.5 + soft, mask);

    // The plain rectangle the photo starts as.
    vec2 inside = uTile * 0.5 - abs(p);
    float edge = min(inside.x, inside.y);
    float thin = max(fwidth(edge), 0.35);
    float tile = smoothstep(-thin, thin, edge);

    // 0 at the letter's foot, 1 at its head.
    float height = p.y / uLetter + 0.5;
    float cutLine = 1.06 - uCut * 1.12;
    float trimmed = smoothstep(cutLine - 0.01, cutLine + 0.01, height) * step(0.0001, uCut);
    float shape = mix(tile, letter, trimmed);

    // The photo fills its rectangle and is cropped the way the page crops it (object-fit: cover, object-position: focus).
    vec2 q = p / uTile + 0.5;
    float shapeAspect = uTile.x / uTile.y;
    vec2 part = shapeAspect > uAspect ? vec2(1.0, uAspect / shapeAspect) : vec2(shapeAspect / uAspect, 1.0);
    vec2 at = q * part + (1.0 - part) * vec2(uFocus.x, 1.0 - uFocus.y);
    vec3 color = mix(uAccent, texture2D(uPhoto, at).rgb, uPhotoIn) * uDim;

    // Printed in the site's two inks: dark where the photo is dark, orange where it is light.
    float light = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, mix(uInk, uAccent, smoothstep(0.06, 0.8, light)), uTint * uPhotoIn);

    // Black rises from the foot of the letter, with a soft edge. It carries the same fine pale grain as the page's other black surfaces.
    float grain = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453);
    float level = uInkLevel * 1.08 - 0.04;
    color = mix(color, uInk + grain * grain * 0.07, (1.0 - smoothstep(level - 0.012, level + 0.012, height)) * step(0.0001, uInkLevel));

    gl_FragColor = vec4(color, shape);
  }
`

type Glyph = {
  /** How wide the letter itself is, and the size of its mask picture, in capital-letter heights. */
  advance: number
  width: number
  height: number
  mask: CanvasTexture
}

/** The gap between two letters, in capital-letter heights. */
const GAP = 0.035

/** Measures the word and paints one mask per different letter. */
function buildGlyphs(word: string) {
  const measure = document.createElement('canvas').getContext('2d')!
  measure.font = `400 1000px ${FONT}`
  const capRatio = measure.measureText('H').actualBoundingBoxAscent / 1000
  const fontPx = CAP / capRatio

  const painted = new Map<string, Glyph>()
  for (const char of new Set(word)) {
    const advance = (measure.measureText(char).width / 1000) * fontPx
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(advance + PAD * 2)
    canvas.height = CAP + PAD * 2
    const context = canvas.getContext('2d')!
    context.fillStyle = '#000'
    context.fillRect(0, 0, canvas.width, canvas.height)
    if ('filter' in context) context.filter = 'blur(4px)'
    context.fillStyle = '#fff'
    context.font = `400 ${fontPx}px ${FONT}`
    context.textBaseline = 'alphabetic'
    context.fillText(char, PAD, PAD + CAP)

    const mask = new CanvasTexture(canvas)
    mask.colorSpace = NoColorSpace
    mask.minFilter = LinearMipmapLinearFilter
    mask.magFilter = LinearFilter
    mask.anisotropy = 8
    painted.set(char, { mask, advance: advance / CAP, width: canvas.width / CAP, height: canvas.height / CAP })
  }

  return { glyphs: [...word].map((char) => painted.get(char)!), masks: [...painted.values()].map((p) => p.mask) }
}

/**
 * Where each letter stands when the word is set in `rows` lines (one line on
 * a wide screen, two on a phone), in capital-letter heights from the middle
 * of the word (y pointing down), and how wide and tall the whole thing is.
 */
function arrange(glyphs: Glyph[], rows: number) {
  const perRow = Math.ceil(glyphs.length / rows)
  const leading = 1.1
  const places: { x: number; y: number }[] = []
  let widest = 0
  for (let row = 0; row < rows; row++) {
    const line = glyphs.slice(row * perRow, (row + 1) * perRow)
    const width = line.reduce((sum, glyph) => sum + glyph.advance, 0) + GAP * (line.length - 1)
    widest = Math.max(widest, width)
    let x = -width / 2
    for (const glyph of line) {
      places.push({ x: x + glyph.advance / 2, y: (row - (rows - 1) / 2) * leading })
      x += glyph.advance + GAP
    }
  }
  return { places, width: widest, height: 1 + (rows - 1) * leading }
}

const clamp = (x: number, min = 0, max = 1) => Math.min(Math.max(x, min), max)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export type WordPhoto = { colour: string; focus: [number, number] }

type Props = {
  word: string
  /** One photo per letter: the last photos of the side scroll, in its order. */
  photos: WordPhoto[]
  /** The tall section whose scrolling drives everything. */
  section: RefObject<HTMLElement | null>
  /** Told every frame whether the photos are being drawn here (so the side scroll hides its own). */
  onTaken: (taken: boolean) => void
  /** Told every frame how far the orange has risen (0..1) and how far the black has (0..1). */
  onEnding: (flood: number, ink: number) => void
  inView: boolean
}

function Word({ word, photos, section, onTaken, onEnding }: Props) {
  const [built, setBuilt] = useState<ReturnType<typeof buildGlyphs> | null>(null)

  useEffect(() => {
    let alive = true
    let made: ReturnType<typeof buildGlyphs> | null = null
    document.fonts
      .load(`400 200px ${FONT}`)
      .catch(() => undefined)
      .then(() => {
        if (!alive) return
        made = buildGlyphs(word)
        setBuilt(made)
      })
    return () => {
      alive = false
      made?.masks.forEach((mask) => mask.dispose())
    }
  }, [word])

  // The photos, one per letter.
  const [textures, setTextures] = useState<(Texture | null)[]>([])
  useEffect(() => {
    let alive = true
    const loaded: Texture[] = []
    const loader = new TextureLoader()
    photos.forEach((photo, i) => {
      loader.load(photo.colour, (texture) => {
        if (!alive) return texture.dispose()
        texture.colorSpace = NoColorSpace
        texture.minFilter = LinearMipmapLinearFilter
        texture.magFilter = LinearFilter
        texture.anisotropy = 8
        loaded.push(texture)
        setTextures((current) => {
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
  }, [photos])

  const materials = useMemo(
    () =>
      (built?.glyphs ?? []).map((glyph) => ({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        uniforms: {
          uMask: { value: glyph.mask },
          uPhoto: { value: null as Texture | null },
          uMesh: { value: new Vector2(1, 1) },
          uTile: { value: new Vector2(1, 1) },
          uSheet: { value: new Vector2(1, 1) },
          uLetter: { value: 1 },
          uPhotoIn: { value: 0 },
          uAspect: { value: 1 },
          uFocus: { value: new Vector2(0.5, 0.5) },
          uDim: { value: 1 },
          uTint: { value: 0 },
          uCut: { value: 0 },
          uAccent: { value: new Color(ACCENT).convertLinearToSRGB() },
          uInk: { value: new Color(INK_COLOR).convertLinearToSRGB() },
          uInkLevel: { value: 0 },
        },
      })),
    [built],
  )

  const meshes = useRef<(Mesh | null)[]>([])

  useFrame((state) => {
    const element = section.current
    if (!built || !element) return
    const { glyphs } = built
    const { width: vw, height: vh } = state.size
    const upright = vw < 760

    // How far the footer has come up the screen (0..1), then how far through it the page has scrolled, in screen heights.
    const box = element.getBoundingClientRect()
    const arriving = clamp(1 - box.top / vh)
    const t = clamp(-box.top / Math.max(box.height - vh, 1)) * scrollLength
    const cut = clamp((t - SETTLE) / CUT)
    const flooding = clamp((t - SETTLE - CUT - PAUSE) / FLOOD)
    const flood = inOut(flooding)
    const ink = clamp((t - SETTLE - CUT - PAUSE - FLOOD) / INK)
    onEnding(flood, ink)

    // The photos are drawn here from a little before the side scroll lets go of them, exactly on top of its own; a moment
    // later its own are hidden. So the change of hands is never seen. Until every photo has loaded they stay where they are.
    const ready = glyphs.every((_, i) => textures[i])
    const drawn = box.top < vh * 1.12 && (ready || arriving >= 1)
    onTaken(drawn && box.top < vh * 1.06)
    // Where the side scroll's photos are right now; only needed until they are in the word.
    const hanging = drawn && arriving < 1 ? photoPlaces() : null

    // First the word is a modest row in the middle; with the orange it grows to fill the screen (two lines on a phone).
    const row = arrange(glyphs, 1)
    const full = arrange(glyphs, upright ? 2 : 1)
    const rowSize = Math.min(vh * 0.4, (vw * (upright ? 0.84 : 0.56)) / row.width)
    const fullSize = Math.min((vh * 0.74) / full.height, (vw * 0.93) / full.width)
    const grow = inOut(clamp(flooding * 1.15))
    const letter = mix(rowSize, fullSize, grow)

    glyphs.forEach((glyph, i) => {
      const mesh = meshes.current[i]
      if (!mesh) return
      mesh.visible = drawn
      if (!drawn) return
      const u = (mesh.material as ShaderMaterial).uniforms

      // Its place in the word, and the rectangle the photo has there: the letter's own box.
      const slotX = vw / 2 + mix(row.places[i].x * rowSize, full.places[i].x * fullSize, grow)
      const slotY = vh / 2 + mix(row.places[i].y * rowSize, full.places[i].y * fullSize, grow)
      const slotW = glyph.advance * letter

      // Where it comes from: its place in the side scroll (or from below the screen, if there is no side scroll).
      const from = hanging?.[hanging.length - glyphs.length + i] ?? { x: slotX, y: vh + letter, width: slotW, height: letter, dim: 1 }
      // One after another, from the left; all are in place when the footer reaches the top.
      const move = arriving < 1 ? inOut(clamp(arriving * 1.3 - i * 0.06)) : 1

      const x = mix(from.x, slotX, move)
      const y = mix(from.y, slotY, move)
      const tileW = mix(from.width, slotW, move)
      const tileH = mix(from.height, letter, move)
      const sheetW = glyph.width * letter
      const sheetH = glyph.height * letter
      const meshW = Math.max(tileW, sheetW)
      const meshH = Math.max(tileH, sheetH)

      // Screen position has y going down; the scene has y going up and its origin in the middle.
      mesh.position.set(x - vw / 2, vh / 2 - y, 0)
      // A slight lean on the way, gone on arrival.
      mesh.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.07 * Math.sin(Math.PI * move)
      mesh.scale.set(meshW, meshH, 1)
      u.uMesh.value.set(meshW, meshH)
      u.uTile.value.set(tileW, tileH)
      u.uSheet.value.set(sheetW, sheetH)
      u.uLetter.value = letter
      u.uDim.value = mix(from.dim, 1, move)

      // Trimmed to its letter and printed in the two inks, then filled with black, one letter after another from the left.
      const trim = inOut(clamp(cut * 1.5 - i * 0.1))
      u.uCut.value = trim
      u.uTint.value = clamp(trim * 1.6)
      u.uInkLevel.value = inOut(clamp(ink * 1.5 - i * 0.1))

      const texture = textures[i]
      u.uPhoto.value = texture ?? null
      u.uPhotoIn.value = texture ? 1 : 0
      if (texture) {
        const image = texture.image as { width: number; height: number }
        u.uAspect.value = image.width / image.height
        u.uFocus.value.set(photos[i].focus[0], photos[i].focus[1])
      }
    })
  })

  return (
    <>
      {materials.map((material, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            meshes.current[i] = mesh
          }}
          visible={false}
          frustumCulled={false}
          renderOrder={i}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial args={[material]} />
        </mesh>
      ))}
    </>
  )
}

/**
 * The footer's word. The photos of the side scroll leave their row and line
 * up, each is trimmed to a letter, the word grows to fill the screen, and
 * the letters fill with black. The scene is measured in screen pixels and
 * covers the whole screen.
 *
 * Nothing is drawn while the footer is far away ("never"); near it the
 * picture is drawn on every frame ("always"), so it can never miss a change.
 * When the letters are taken off the page, React Three Fiber
 * disposes the planes and their materials and lets the WebGL context go, and
 * the effects above dispose the photos and the masks.
 */
export default function Letters(props: Props) {
  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      frameloop={props.inView ? 'always' : 'never'}
      // Measured at once and never on scroll. By default the canvas waits until the page has stood still for 50 ms before it
      // takes its size, and draws nothing until then: mounted while the visitor is scrolling (as it always is here), it
      // would stay empty for as long as the page keeps moving.
      resize={{ scroll: false, debounce: 0 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Word {...props} />
    </Canvas>
  )
}
