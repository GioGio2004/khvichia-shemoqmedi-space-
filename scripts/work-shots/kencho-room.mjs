/**
 * Takes the Kencho Room case-study pictures from the live site, https://room.kenchogroup.ge/.
 *
 *   node scripts/work-shots/kencho-room.mjs                      every picture, into src/assets/work/kencho-room/
 *   node scripts/work-shots/kencho-room.mjs --only room,kitchen  only these names again; the rest of the folder is kept
 *   node scripts/work-shots/kencho-room.mjs --raw qa/kencho-room also keep the untouched PNG of every capture there
 *   node scripts/work-shots/kencho-room.mjs --gpu software       draw the 3D room in software (see below)
 *
 * What it does, like a visitor would:
 *   1. opens the site, waits for the sound gate and presses START;
 *   2. presses the opening's own Skip (the narrated opening is 30 seconds long and is not what we shoot);
 *   3. scrolls the page down to its footer, which is the hand-drawn 3D room, and waits for it to draw itself;
 *   4. uses the room's own controls for each state: the kitchen close-up, the finishes popup, the gallery wall;
 *   5. does the same on a phone, where the visitor stands inside the room and turns between four stops.
 *
 * Pictures (viewport only, never the whole page):
 *   desktop 1440x900 at 2x  ->  <name>-2880.avif, <name>-1440.avif, <name>-1440.webp
 *   phone   390x844 at 3x   ->  <name>-1170.avif, <name>-780.avif, <name>-780.webp
 *   and gallery-candidate.webp: the room at exactly 1440x900, 1x, WebP quality 82, for the home page's gallery.
 *
 * Graphics: the room is WebGL. By default the script starts the installed Edge headless with no graphics flags,
 * which on this machine draws on the real graphics card and is fast. With the software flags
 * (--enable-unsafe-swiftshader --use-angle=swiftshader, here "--gpu software") the room does draw, but so slowly
 * that screenshots of the page timed out after 30 seconds, so software is only the fallback.
 *
 * "drawing" is the one picture that depends on an exact moment (the room half drawn, before the colour). The
 * page's clock is paused just before the room is uncovered and then stepped forward by a fixed amount, so the
 * same frame comes out every time whatever the machine is doing.
 *
 * Nothing is typed, sent or accepted anywhere: the site has no cookie banner and no form on this path.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

const root = fileURLToPath(new URL('../..', import.meta.url))
const OUT = join(root, 'src/assets/work/kencho-room')
const URL_LIVE = 'https://room.kenchogroup.ge/'

const DESKTOP = { width: 1440, height: 900, scale: 2 }
const PHONE = { width: 390, height: 844, scale: 3 }
/** How far into the room's drawing-in the "drawing" picture is taken (milliseconds after it starts). */
const DRAW_AT = 3100

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const only = flag('only')?.split(',').map((s) => s.trim())
const rawDir = flag('raw') ? (isAbsolute(flag('raw')) ? flag('raw') : join(root, flag('raw'))) : null
const software = flag('gpu') === 'software'
const wanted = (name) => !only || only.includes(name)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const started = Date.now()
const say = (...a) => console.log(`[${((Date.now() - started) / 1000).toFixed(0).padStart(3)}s]`, ...a)

/** name -> { png, kind } */
const shots = new Map()

async function take(page, name, kind) {
  if (!wanted(name)) return
  const png = await page.screenshot({ type: 'png', timeout: 90_000 })
  shots.set(name, { png, kind })
  say('shot', name)
}

/** Through the sound gate and the opening, onto the page. */
async function enter(page, phone) {
  const press = (target) => (phone ? target.tap() : target.click())
  await page.goto(URL_LIVE, { waitUntil: 'load', timeout: 90_000 })
  await page.waitForSelector('.intro[data-ready]', { timeout: 90_000 })
  await sleep(2500) // the START button grows in
  await press(page.locator('.intro-orb'))
  await sleep(2500)
  await press(page.getByRole('button', { name: /skip/i }))
  await page.waitForSelector('.page', { timeout: 60_000 })
  await sleep(4500) // the colour burst, then the hero lands
}

/** Scroll the way the site's own checks do: through its smooth scroller, without the glide. */
const scrollTo = (page, id, f = 0) =>
  page.evaluate(
    ([id, f]) => {
      const lenis = window.__lenis
      const to = (y) => (lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y))
      if (id === 'end') return to(document.documentElement.scrollHeight)
      const el = document.getElementById(id)
      const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
      const top = box.getBoundingClientRect().top + window.scrollY
      const span = box.offsetHeight - window.innerHeight
      to(top + f * (span > 0 && box !== el ? span : box.offsetHeight))
    },
    [id, f],
  )

const roomView = (page) => page.evaluate(() => document.querySelector('.room')?.dataset.view)

async function desktop(browser) {
  const ctx = await browser.newContext({ viewport: { width: DESKTOP.width, height: DESKTOP.height }, deviceScaleFactor: DESKTOP.scale })
  const page = await ctx.newPage()
  // a clock we can pause: it runs in real time until "drawing" needs one exact frame
  await page.clock.install()
  await enter(page, false)

  // palettes: the page's five kitchen palettes; the pointer opens Forest green
  await scrollTo(page, 'finishes', 0.15)
  await sleep(2500)
  await page.locator('.pal-col').nth(1).hover()
  await sleep(1800)
  await take(page, 'palettes', 'desktop')

  // the room is mounted while the page still covers it (it only draws once uncovered)
  await page.mouse.move(DESKTOP.width / 2, DESKTOP.height / 2)
  await scrollTo(page, 'outro', 0.1)
  await page.waitForSelector('.room canvas', { timeout: 60_000 })
  await sleep(2000)

  // drawing: pause the clock, uncover the room, step exactly DRAW_AT into the drawing
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 100))
  await scrollTo(page, 'end')
  for (let i = 0; i < 4; i++) {
    await page.clock.runFor(100) // the scroll is noticed, the room wakes and starts its timeline
    await sleep(250)
  }
  // the pointer moves over the room, so the page's own cursor ring gets out of the way, as it does for a visitor
  await page.mouse.move(DESKTOP.width / 2 + 4, DESKTOP.height / 2 + 4)
  await page.clock.runFor(DRAW_AT)
  await sleep(600)
  await take(page, 'drawing', 'desktop')
  await page.clock.resume()
  if (!['room', 'kitchen', 'finishes', 'gallery-wall'].some(wanted)) return void (await ctx.close())

  // room: fully drawn and coloured, with its four labels
  await sleep(10_000)
  await page.mouse.move(DESKTOP.width / 2, DESKTOP.height / 2 + 40)
  await sleep(1500)
  if ((await roomView(page)) !== 'room') throw new Error('the room is not showing')
  await take(page, 'room', 'desktop')

  // kitchen: the close-up, with the pointer on the wall units so their material tag shows
  await page.locator('.callout[data-set=room]').first().click({ force: true })
  await sleep(7000)
  if ((await roomView(page)) !== 'kitchen') throw new Error('the kitchen close-up did not open')
  const dot = await page.evaluate(() => {
    const r = document.querySelector('.callout-dot[data-set=note]').getBoundingClientRect()
    return [r.x + r.width / 2, r.y + r.height / 2]
  })
  await page.mouse.move(dot[0] + 60, dot[1] + 40, { steps: 6 })
  await page.mouse.move(dot[0] + 30, dot[1] + 20, { steps: 6 })
  await sleep(2500)
  await take(page, 'kitchen', 'desktop')

  // finishes: the popup open, Forest green picked and applied live
  await page.locator('.finish-open').click()
  await sleep(1500)
  await page.locator('.finishes-item').nth(1).click()
  await page.mouse.move(DESKTOP.width - 300, 300)
  await sleep(4000)
  await take(page, 'finishes', 'desktop')

  // gallery-wall: Esc closes the popup, Esc again steps back to the room, then the gallery wall
  await page.keyboard.press('Escape')
  await sleep(1500)
  await page.keyboard.press('Escape')
  await sleep(5000)
  if ((await roomView(page)) !== 'room') throw new Error('Esc did not step back to the room')
  await page.locator('.callout[data-set=room]').nth(1).click({ force: true })
  await sleep(7000)
  if ((await roomView(page)) !== 'gallery') throw new Error('the gallery wall did not open')
  await page.mouse.move(DESKTOP.width / 2, DESKTOP.height - 20)
  await sleep(1500)
  await take(page, 'gallery-wall', 'desktop')

  await ctx.close()
}

/** The room after START at exactly 1440x900, 1x: a candidate for the home page's gallery slide. */
async function candidate(browser) {
  if (!wanted('gallery-candidate')) return
  const ctx = await browser.newContext({ viewport: { width: DESKTOP.width, height: DESKTOP.height }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await enter(page, false)
  await page.mouse.move(DESKTOP.width / 2, DESKTOP.height / 2 + 40)
  await scrollTo(page, 'end')
  await page.waitForSelector('.room canvas', { timeout: 60_000 })
  await sleep(11_000)
  // a pointer move over the room hides the page's own cursor ring
  await page.mouse.move(DESKTOP.width / 2 + 4, DESKTOP.height / 2 + 44)
  await sleep(2000)
  if ((await roomView(page)) !== 'room') throw new Error('the room is not showing')
  await take(page, 'gallery-candidate', 'candidate')
  await ctx.close()
}

async function phone(browser) {
  if (!wanted('room-mobile') && !wanted('kitchen-mobile')) return
  const ctx = await browser.newContext({ viewport: { width: PHONE.width, height: PHONE.height }, deviceScaleFactor: PHONE.scale, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await enter(page, true)
  await scrollTo(page, 'end')
  await page.waitForSelector('.room canvas', { timeout: 60_000 })
  await sleep(13_000)

  // room-mobile: standing inside the room at the first stop, the stops on a paper sheet
  await page.waitForSelector('.room-stops[data-on]', { timeout: 30_000 })
  await take(page, 'room-mobile', 'mobile')

  // kitchen-mobile: the close-up, its controls stacked along the bottom
  // (the first stop is the kitchen; the third is the workshop door, which leaves for the main site)
  const stop = await page.locator('.stops-meta').textContent()
  if (!/kitchen/i.test(stop ?? '')) throw new Error(`expected to stand at the kitchen, found "${stop}"`)
  await page.locator('.stops-cta').tap()
  await sleep(7000)
  if ((await roomView(page)) !== 'kitchen') throw new Error('the kitchen close-up did not open on the phone')
  await take(page, 'kitchen-mobile', 'mobile')

  await ctx.close()
}

/** PNG -> the optimised files. Returns what was written, with true pixel sizes. */
async function write(name, { png, kind }) {
  const meta = await sharp(png).metadata()
  const files = []
  const save = async (file, pipeline) => {
    const info = await pipeline.toFile(join(OUT, file))
    files.push({ file, width: info.width, height: info.height, bytes: info.size })
  }
  const avif = (w) => sharp(png).resize({ width: w, kernel: 'lanczos3' }).avif({ quality: 55, effort: 9 })
  const webp = (w, q) => sharp(png).resize({ width: w, kernel: 'lanczos3' }).webp({ quality: q, effort: 6 })
  if (kind === 'desktop') {
    if (meta.width !== 2880 || meta.height !== 1800) throw new Error(`${name}: expected 2880x1800, got ${meta.width}x${meta.height}`)
    await save(`${name}-2880.avif`, avif(2880))
    await save(`${name}-1440.avif`, avif(1440))
    await save(`${name}-1440.webp`, webp(1440, 80))
  } else if (kind === 'mobile') {
    if (meta.width !== 1170 || meta.height !== 2532) throw new Error(`${name}: expected 1170x2532, got ${meta.width}x${meta.height}`)
    await save(`${name}-1170.avif`, avif(1170))
    await save(`${name}-780.avif`, avif(780))
    await save(`${name}-780.webp`, webp(780, 80))
  } else {
    if (meta.width !== 1440 || meta.height !== 900) throw new Error(`${name}: expected 1440x900, got ${meta.width}x${meta.height}`)
    await save(`${name}.webp`, sharp(png).webp({ quality: 82, effort: 6 }))
  }
  if (rawDir) await writeFile(join(rawDir, `${name}.png`), png)
  return files
}

await mkdir(OUT, { recursive: true })
if (rawDir) await mkdir(rawDir, { recursive: true })

const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
  args: ['--mute-audio', ...(software ? ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] : [])],
})
try {
  const probe = await browser.newPage()
  say(
    'WebGL:',
    await probe.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2')
      const ext = gl?.getExtension('WEBGL_debug_renderer_info')
      return gl ? (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'on') : 'none'
    }),
  )
  await probe.close()
  if (!only || ['palettes', 'drawing', 'room', 'kitchen', 'finishes', 'gallery-wall'].some(wanted)) await desktop(browser)
  await candidate(browser)
  await phone(browser)
} finally {
  await browser.close()
}

const report = {}
for (const [name, shot] of shots) {
  report[name] = await write(name, shot)
  say('wrote', name, report[name].map((f) => `${f.file} ${f.width}x${f.height} ${(f.bytes / 1024).toFixed(0)}kB`).join(', '))
}
console.log(JSON.stringify(report, null, 1))
