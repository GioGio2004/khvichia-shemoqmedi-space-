/**
 * Takes the stills for an awards submission: four pictures of the built site
 * at 1600 x 1200, saved as JPEG in docs/submission/.
 *
 *   npm run build
 *   node scripts/stills.mjs
 *
 * It serves dist/ itself (vite preview on a free port) and drives the
 * installed Edge. The opening, the work gallery, the end of the footer and
 * the Kencho Room case study are shot; change STILLS to pick others.
 */
import { mkdirSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = `${root}docs/submission/`
const PORT = 4387
const BASE = `http://127.0.0.1:${PORT}`

/** Each still: where to go, and how to get to the moment worth showing. */
const STILLS = [
  { name: '01-opening', route: '/', settle: 3500 },
  { name: '02-work-gallery', route: '/', to: '#work', settle: 4500 },
  { name: '03-finale', route: '/', to: 'bottom', settle: 4000 },
  { name: '04-case-kencho-room', route: '/work/kencho-room', settle: 2500 },
]

mkdirSync(out, { recursive: true })
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], { cwd: root, shell: true })
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${BASE}/`)).ok) break
  } catch {
    // Not up yet.
  }
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  for (const still of STILLS) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 })
    await page.goto(BASE + still.route, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    if (still.to === 'bottom') {
      // The footer's word builds itself as the page scrolls, so the page is scrolled down in steps.
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0; y <= height; y += 600) {
        await page.evaluate((top) => window.scrollTo(0, top), y)
        await page.waitForTimeout(80)
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    } else if (still.to) {
      await page.evaluate((selector) => {
        const element = document.querySelector(selector)
        if (element) window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY)
      }, still.to)
    }
    await page.mouse.move(2, 600)
    await page.waitForTimeout(still.settle)
    const png = await page.screenshot()
    await sharp(png).jpeg({ quality: 90, mozjpeg: true }).toFile(`${out}${still.name}.jpg`)
    console.log(`${still.name}.jpg`)
    await page.close()
  }
} finally {
  await browser.close()
  // On Windows the preview server runs under a shell, so its whole process tree is ended; then the script stops.
  if (process.platform === 'win32') await new Promise((resolve) => spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { shell: true }).on('exit', resolve))
  else server.kill()
  process.exit(0)
}
