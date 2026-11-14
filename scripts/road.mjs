/**
 * Turns the originals in photos/road/ into the pictures the page shows.
 *
 *   npm run road
 *
 * Every photos/road/<name>.jpg becomes src/assets/road/<name>-colour.webp:
 * the photo's own colours, at most 1600 pixels on the long side. (The page
 * prints them in its two inks by itself, where it wants that.) Photos in
 * photos/road/unused/ are left alone. Run it again after adding or replacing
 * a photo, then list the photo in src/content/road.ts.
 */
import { mkdir, readdir } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/** Selfies from a front camera come out mirrored. Photos named here are flipped back, so text in them reads correctly. */
const MIRRORED = ['gitex-show-floor']

const root = fileURLToPath(new URL('..', import.meta.url))
const from = `${root}photos/road`
const to = `${root}src/assets/road`

await mkdir(to, { recursive: true })
for (const file of (await readdir(from)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()) {
  const name = basename(file, extname(file))
  let image = sharp(`${from}/${file}`).rotate()
  if (MIRRORED.includes(name)) image = image.flop()
  const written = await image
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(`${to}/${name}-colour.webp`)
  console.log(`${name}-colour.webp  ${written.width}x${written.height}  ${(written.size / 1024).toFixed(0)} kB`)
}
