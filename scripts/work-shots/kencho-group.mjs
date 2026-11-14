/**
 * Takes the case-study pictures of the live Kencho Group website and saves them, ready for the page.
 *
 *   node scripts/work-shots/kencho-group.mjs                      every picture
 *   node scripts/work-shots/kencho-group.mjs --only home,viewer   only these names
 *   node scripts/work-shots/kencho-group.mjs --preview <folder>   also save a small JPEG of each one there, to look at
 *
 * Public pages only, English version, nothing is typed or sent. Pictures are one screen each, not the whole page.
 *
 * Desktop pictures: a 1440x900 screen at twice the sharpness, saved as <name>-2880.avif, <name>-1440.avif and
 * <name>-1440.webp. Phone pictures: a 390x844 screen at three times the sharpness, saved as <name>-1170.avif,
 * <name>-780.avif and <name>-780.webp. Everything lands in src/assets/work/kencho-group/.
 *
 * It prints one line per picture with the true size of the largest file, and ends with code 1 if a picture failed.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

const root = fileURLToPath(new URL('../..', import.meta.url))
const outDir = join(root, 'src', 'assets', 'work', 'kencho-group')
const SITE = 'https://www.kenchogroup.ge'

const args = process.argv.slice(2)
const flag = (name) => {
  const at = args.indexOf(`--${name}`)
  return at >= 0 ? args[at + 1] : undefined
}
const only = flag('only')?.split(',').map((name) => name.trim()).filter(Boolean)
const previewDir = flag('preview')

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }

/** How far below the top of the screen a section should start, so the floating header does not cover it. */
const UNDER_HEADER = { desktop: 132, mobile: 96 }

/**
 * Each picture: the page, and what to do on it before the picture is taken.
 * `top` is a CSS selector: the page is scrolled until that element sits just under the header
 * (or `offset` pixels below the top of the screen, when the picture needs another framing).
 */
const SHOTS = [
  { name: 'home', kind: 'desktop', path: '/en' },
  // A little higher than usual, so the second row's titles clear the floating "Ask Kencho AI" button.
  { name: 'categories', kind: 'desktop', path: '/en', top: '.featured-gallery-card', offset: 76 },
  { name: 'process', kind: 'desktop', path: '/en', top: '#roadmap .process-overview-summary' },
  { name: 'catalogue', kind: 'desktop', path: '/en/gallery' },
  { name: 'viewer', kind: 'desktop', path: '/en/gallery', prepare: openViewer },
  { name: 'contact', kind: 'desktop', path: '/en/contact' },
  { name: 'home-mobile', kind: 'mobile', path: '/en' },
  { name: 'catalogue-mobile', kind: 'mobile', path: '/en/gallery' },
]

/** Opens the first photograph of the catalogue in the full-screen viewer. */
async function openViewer(page) {
  await page.locator('.opera-card').first().click()
  await page.locator('dialog.gallery-viewer[open]').waitFor({ state: 'visible', timeout: 15000 })
}

/** The site scrolls with Lenis on desktop; ask it to jump, or it would glide there and fight the picture. */
async function scrollTo(page, y) {
  await page.evaluate((to) => {
    if (window.__lenis) window.__lenis.scrollTo(to, { immediate: true, force: true })
    else window.scrollTo(0, to)
  }, Math.max(0, Math.round(y)))
}

/** Waits until the fonts are in and every picture on screen has really loaded, then a little longer for motion. */
async function settle(page, extra = 1800) {
  await page.evaluate(() => document.fonts.ready)
  await page
    .waitForFunction(
      () =>
        [...document.images]
          .filter((img) => {
            const box = img.getBoundingClientRect()
            return box.width > 0 && box.bottom > 0 && box.top < innerHeight
          })
          .every((img) => img.complete && img.naturalWidth > 0),
      undefined,
      { timeout: 20000, polling: 250 },
    )
    .catch(() => console.warn('  some pictures on screen were still loading after 20 s'))
  await page.waitForTimeout(extra)
}

/** If the site asks about optional analytics, keep only what is essential. */
async function declineOptional(page) {
  const essentialOnly = page.locator('.privacy-choices-banner button', { hasText: /essential only/i })
  if (await essentialOnly.count()) {
    await essentialOnly.first().click()
    await page.waitForTimeout(500)
  }
}

async function take(browser, shot) {
  const context = await browser.newContext({ ...(shot.kind === 'mobile' ? PHONE : DESKTOP), locale: 'en-US' })
  const page = await context.newPage()
  try {
    const response = await page.goto(SITE + shot.path, { waitUntil: 'load', timeout: 60000 })
    if (!response || !response.ok()) throw new Error(`${shot.path} answered ${response?.status()}`)
    await settle(page, 2500)
    await declineOptional(page)
    if (shot.top) {
      const y = await page.evaluate((selector) => {
        const element = document.querySelector(selector)
        return element ? element.getBoundingClientRect().top + window.scrollY : null
      }, shot.top)
      if (y === null) throw new Error(`nothing on the page matches ${shot.top}`)
      await scrollTo(page, y - (shot.offset ?? UNDER_HEADER[shot.kind]))
      await settle(page)
    }
    if (shot.prepare) {
      await shot.prepare(page)
      await settle(page, 2200)
    }
    return await page.screenshot({ type: 'png' })
  } finally {
    await context.close()
  }
}

/** Saves one screenshot in the three files the page needs. Returns the true size of the largest one. */
async function save(shot, png) {
  const [large, small] = shot.kind === 'mobile' ? [1170, 780] : [2880, 1440]
  const base = join(outDir, shot.name)
  const full = sharp(png)
  const meta = await full.metadata()
  if (meta.width !== large) throw new Error(`${shot.name}: expected ${large} px wide, got ${meta.width}`)
  await full.clone().avif({ quality: 55, effort: 9 }).toFile(`${base}-${large}.avif`)
  const half = full.clone().resize({ width: small })
  await half.clone().avif({ quality: 55, effort: 9 }).toFile(`${base}-${small}.avif`)
  await half.clone().webp({ quality: 80, effort: 6 }).toFile(`${base}-${small}.webp`)
  if (previewDir) {
    await mkdir(previewDir, { recursive: true })
    await writeFile(join(previewDir, `${shot.name}.jpg`), await half.clone().jpeg({ quality: 70 }).toBuffer())
  }
  return { width: meta.width, height: meta.height }
}

const wanted = only ? SHOTS.filter((shot) => only.includes(shot.name)) : SHOTS
if (only && wanted.length !== only.length) {
  console.error(`Unknown name in --only. Known: ${SHOTS.map((shot) => shot.name).join(', ')}`)
  process.exit(1)
}

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
})
let failed = 0
try {
  for (const shot of wanted) {
    try {
      const size = await save(shot, await take(browser, shot))
      console.log(`${shot.name}: ${size.width}x${size.height} (${SITE}${shot.path})`)
    } catch (error) {
      failed++
      console.error(`${shot.name}: FAILED, ${error.message}`)
    }
  }
} finally {
  await browser.close()
}
process.exit(failed ? 1 : 0)
