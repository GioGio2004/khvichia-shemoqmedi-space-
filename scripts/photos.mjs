/**
 * Turns the originals in photos/ into the small files the site serves.
 *
 *   npm run photos
 *
 * For every photos/<name>.jpg (or .jpeg, .png, .webp) it writes
 * src/assets/photos/<name>-<width>.avif and .webp at a few widths, and lists
 * them in src/assets/photos/manifest.json. The site picks the right width and
 * format for each screen (see src/content/photos.ts).
 *
 * Photos that have not changed are skipped, and files whose original was
 * deleted are removed, so it is safe to run as often as you like.
 */
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/** Selfies from a front camera come out mirrored. Photos named here are flipped back, so text in them reads correctly. */
const MIRRORED = ['energo-hack-team', 'gitex-torq-selfie']

/** Widths to make, in pixels. A photo never gets a width larger than its original. */
const WIDTHS = [480, 800, 1200, 1600]
const AVIF = { quality: 55, effort: 6 }
const WEBP = { quality: 78, effort: 5 }
/** Change this when the settings above change, so every photo is made again. */
const SETTINGS = 'v1'

const root = fileURLToPath(new URL('..', import.meta.url))
const sourceDir = join(root, 'photos')
const outDir = join(root, 'src/assets/photos')
const manifestPath = join(outDir, 'manifest.json')

const hex = (n) => Math.round(n).toString(16).padStart(2, '0')

await mkdir(outDir, { recursive: true })
const previous = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {}
const originals = (await readdir(sourceDir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()

const manifest = {}
const keep = new Set(['manifest.json'])

for (const file of originals) {
  const name = basename(file, extname(file))
  const bytes = await readFile(join(sourceDir, file))
  const mirrored = MIRRORED.includes(name)
  const hash = createHash('sha1').update(bytes).update(SETTINGS).update(String(mirrored)).digest('hex').slice(0, 10)

  // Upright, flipped back if it is a selfie, and in plain sRGB so the page
  // and the 3D scene show exactly the same colours.
  const image = sharp(bytes).rotate()
  if (mirrored) image.flop()
  const upright = await image.toColourspace('srgb').toBuffer({ resolveWithObject: true })
  const { width, height } = upright.info

  const full = Math.min(width, WIDTHS.at(-1))
  const widths = [...WIDTHS.filter((w) => w < full * 0.9), full]
  const outputs = widths.flatMap((w) => [`${name}-${w}.avif`, `${name}-${w}.webp`])
  outputs.forEach((f) => keep.add(f))

  const before = previous[name]
  if (before?.hash === hash && outputs.every((f) => existsSync(join(outDir, f)))) {
    manifest[name] = before
    console.log(`  same     ${name}`)
    continue
  }

  for (const w of widths) {
    const resized = sharp(upright.data).resize({ width: w })
    await resized.clone().avif(AVIF).toFile(join(outDir, `${name}-${w}.avif`))
    await resized.clone().webp(WEBP).toFile(join(outDir, `${name}-${w}.webp`))
  }
  // The photo's average colour fills its frame while the file loads.
  const { data } = await sharp(upright.data).resize(1, 1, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  manifest[name] = { width, height, color: `#${hex(data[0])}${hex(data[1])}${hex(data[2])}`, widths, hash }
  console.log(`  made     ${name}  ${width}x${height}  ${widths.join(', ')}`)
}

for (const file of await readdir(outDir)) {
  if (keep.has(file)) continue
  await rm(join(outDir, file))
  console.log(`  removed  ${file}`)
}

await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
console.log(`${originals.length} photos in src/assets/photos`)
