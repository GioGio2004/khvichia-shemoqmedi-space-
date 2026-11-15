/**
 * Takes the QA screenshots of the built site in a real browser.
 *
 *   npm run build
 *   npm run qa:shots                       every state, 7 widths, with and without motion, into qa/baseline/
 *   npm run qa:shots -- --out qa/phase1    the same, into another folder
 *   npm run qa:shots -- --widths 1440,390 --motion normal --only gallery-open,contact-open-zoom
 *
 *   npm run qa:shots -- --routes home,work/kalami
 *
 * Flags:
 *   --out <dir>       where the pictures go, from the top of the repo (default qa/baseline)
 *   --url <address>   a site that is already running; without it the script serves the built site itself (a copy
 *                     of it made at the start, so a build that runs meanwhile does not disturb it) and stops it at
 *                     the end
 *   --dist <dir>      the built site to serve when there is no --url (default dist)
 *   --widths <list>   which of 1920,1440,1024,768,390,375,320 to shoot (default all)
 *   --motion <mode>   normal, reduce or both (default both); reduce = the browser asks for less motion
 *   --routes <list>   pages to shoot (default the home page). The home page gets the named states below; any other
 *                     page gets "top", one picture per screen height down to the bottom (12 at most) and one of the
 *                     whole page. Write them without the first slash (home, work/kalami): Git Bash on Windows turns
 *                     an argument that starts with a slash into a file path
 *   --only <list>     shoot only these names again (for example hero,gallery-2); the rest of the folder is kept
 *   --jobs <n>        how many browsers work at the same time (default 3)
 *   --channel <name>  which installed browser to drive (default msedge; chrome also works)
 *   --gpu <mode>      auto (default): the 3D parts are drawn by the graphics card if there is one; software: always
 *                     drawn in software, which is much slower but the same on every machine
 *
 * The home page's states, in order: hero, skills, stack-interface, stack-engine, stack-around, stack-engine-hover,
 * gallery-1 .. gallery-N, gallery-open, frames-first, frames-bery, frames-last, footer-letters, footer-end,
 * menu-open, about-open, contact-open, contact-open-zoom (a close-up of the outlined name around "Kv", three times as sharp).
 * With less motion nothing is pinned: the frames-* pictures show that photo of the still list in the middle of the
 * screen, and the footer is its last state in type from the start.
 *
 * Pictures land in <out>/<motion>/<width>/<nn>-<name>.png (other pages in a folder of their own under the width),
 * and <out>/manifest.json lists every picture with any console or page errors seen on the way.
 *
 * How each state is reached is read from the page itself, never from fixed pixel offsets: the cards and their
 * spacers are measured, the side scroll and the footer are asked what they are showing (the values they write on
 * their stages), and the gallery is driven with the same keys a person would use.
 *
 * The script ends with code 0 even when the page logged errors (they are listed). It ends with 1 only when a
 * picture could not be taken at all.
 */
import { existsSync } from 'node:fs'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = fileURLToPath(new URL('..', import.meta.url))

/** Screen sizes to shoot. The three narrow ones are phones: touch, and a phone's way of sizing the page. */
const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844, phone: true },
  { width: 375, height: 667, phone: true },
  { width: 320, height: 568, phone: true },
]
/** Ports that belong to other things on this machine. */
const TAKEN = [4173, 5173]
/** Fixed names of the three cards after the skills card, in order. */
const CARDS = ['interface', 'engine', 'around']
/**
 * Where the gallery says which site is in the middle ("01 / 04"). The page has carried it in two places: a line of its
 * own under the row, and later between the previous and next buttons.
 */
/** The work section says which project is in the middle (data-slide, from 1) and how many there are (data-slides). */
const COUNT = '#work'
/** How much sharper the close-up of the outlined name is. */
const ZOOM = 3

// ---------- the command line ----------

function readFlags(argv) {
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const word = argv[i]
    if (!word.startsWith('--')) throw new Error(`Did not understand "${word}". Flags start with --.`)
    const [name, inline] = word.slice(2).split('=')
    const value = inline ?? argv[++i]
    if (value === undefined || value.startsWith('--')) throw new Error(`--${name} needs a value.`)
    flags[name] = value
  }
  return flags
}

const list = (text) =>
  text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

/** One page from --routes: "/work/kalami", "work/kalami" and "home" (or "/") are all fine. */
function readRoute(text) {
  // Git Bash on Windows rewrites an argument that starts with a slash into a Windows path before the script sees it.
  if (/^\/?[a-z]:[\\/]/i.test(text)) {
    throw new Error(`--routes got "${text}": the shell turned the page's address into a file path. Write it without the first slash (work/kalami, or home for the home page).`)
  }
  if (text === 'home') return '/'
  return text.startsWith('/') ? text : `/${text}`
}

function readOptions() {
  const flags = readFlags(process.argv.slice(2))
  const known = ['out', 'url', 'dist', 'widths', 'motion', 'routes', 'only', 'jobs', 'channel', 'gpu']
  for (const name of Object.keys(flags)) if (!known.includes(name)) throw new Error(`Unknown flag --${name}. Known: ${known.map((k) => `--${k}`).join(' ')}`)

  const widths = flags.widths ? list(flags.widths).map(Number) : VIEWPORTS.map((v) => v.width)
  const viewports = widths.map((width) => {
    const viewport = VIEWPORTS.find((v) => v.width === width)
    if (!viewport) throw new Error(`No viewport is ${width} wide. Choose from ${VIEWPORTS.map((v) => v.width).join(', ')}.`)
    return viewport
  })

  const motion = flags.motion ?? 'both'
  if (!['normal', 'reduce', 'both'].includes(motion)) throw new Error('--motion is normal, reduce or both.')

  const gpu = flags.gpu ?? 'auto'
  if (!['auto', 'software'].includes(gpu)) throw new Error('--gpu is auto or software.')

  const out = flags.out ?? 'qa/baseline'
  const dist = flags.dist ?? 'dist'
  if (flags.dist && flags.url) throw new Error('Give --url or --dist, not both.')
  return {
    out: isAbsolute(out) ? out : join(root, out),
    dist: isAbsolute(dist) ? dist : join(root, dist),
    url: flags.url ? flags.url.replace(/\/+$/, '') : null,
    viewports,
    motions: motion === 'both' ? ['normal', 'reduce'] : [motion],
    routes: (flags.routes ? list(flags.routes) : ['/']).map(readRoute),
    only: flags.only ? new Set(list(flags.only)) : null,
    jobs: Math.max(1, Number(flags.jobs ?? 3) || 1),
    channel: flags.channel ?? 'msedge',
    gpu,
  }
}

// ---------- serving dist/ ----------

const canListen = (port) =>
  new Promise((resolve) => {
    const probe = createServer()
    probe.once('error', () => resolve(false))
    probe.once('listening', () => probe.close(() => resolve(true)))
    probe.listen(port, '127.0.0.1')
  })

async function freePort() {
  for (let port = 4310; port < 4510; port++) {
    if (!TAKEN.includes(port) && (await canListen(port))) return port
  }
  throw new Error('No free port between 4310 and 4509.')
}

/** Serves the built site with Vite's own preview server and returns its address and a way to stop it. */
/** The files under /assets/ that the built page asks for by name; all of them must be there for the build to be whole. */
async function missingAssets(folder) {
  const html = await readFile(join(folder, 'index.html'), 'utf8')
  const names = new Set([...html.matchAll(/["'(]\/(assets\/[^"')\s]+)/g)].map((match) => match[1]))
  return [...names].filter((name) => !existsSync(join(folder, name)))
}

/**
 * Serves the built site with Vite's own preview server and returns its address and a way to stop it.
 *
 * It serves a copy of the folder, made now, and not the folder itself: a build that runs while the pictures are
 * being taken empties dist/ and fills it again under other file names, and the pages would lose their files
 * half-way through. If a build is running right now (the folder is not whole), it waits for it to finish.
 */
async function serveDist(dist) {
  const where = relative(root, dist) || '.'
  if (!existsSync(join(dist, 'index.html'))) {
    throw new Error(`${where} is missing: there is no built site to shoot. Run "npm run build" first, or pass --url <address> of a site that is already running.`)
  }
  const copy = await mkdtemp(join(tmpdir(), 'qa-shots-'))
  const target = join(copy, 'dist')
  for (let tries = 0; ; tries++) {
    const whole = await cp(dist, target, { recursive: true }).then(
      async () => (await missingAssets(target)).length === 0,
      () => false,
    )
    if (whole) break
    await rm(target, { recursive: true, force: true })
    if (tries === 30) {
      await rm(copy, { recursive: true, force: true })
      throw new Error(`${where} is not a whole build (files the page asks for are missing, or a build never finished). Run "npm run build" again.`)
    }
    if (tries === 0) console.log(`qa-shots: ${where} is being rebuilt; waiting for it.`)
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  const { preview } = await import('vite')
  const port = await freePort()
  // The site's own Vite settings are used, so every address is answered as it will be once deployed: /work/<slug>
  // with that page's own file, and an address that has no file with the "not found" page (see vite.config.ts).
  const server = await preview({
    root: copy,
    configFile: join(root, 'vite.config.ts'),
    logLevel: 'error',
    build: { outDir: 'dist' },
    preview: { port, strictPort: true, host: '127.0.0.1', open: false },
  })
  return {
    url: `http://127.0.0.1:${port}`,
    close: async () => {
      await server.close()
      await rm(copy, { recursive: true, force: true })
    },
  }
}

// ---------- small helpers that run in the page ----------

/** Puts the page at `y` and waits until it stays there (the smooth scrolling needs a moment to agree). */
async function scrollToY(page, y) {
  return page.evaluate(async (wanted) => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))
    const target = Math.max(0, Math.min(Math.round(wanted), document.documentElement.scrollHeight - window.innerHeight))
    let calm = 0
    for (let i = 0; i < 60 && calm < 3; i++) {
      if (Math.abs(window.scrollY - target) > 1) window.scrollTo({ top: target, left: 0, behavior: 'instant' })
      await frame()
      await frame()
      calm = Math.abs(window.scrollY - target) <= 1 ? calm + 1 : 0
    }
    return window.scrollY
  }, y)
}

/** Waits until every picture inside `selector` has arrived (or eight seconds have passed). */
async function waitImages(page, selector) {
  await page
    .waitForFunction((css) => [...document.querySelectorAll(`${css} img`)].every((img) => img.complete && img.naturalWidth > 0), selector, { timeout: 8000 })
    .catch(() => undefined)
}

/**
 * Takes pictures until two in a row are the same, so nothing is caught half-way through a movement. Returns the
 * last picture and whether the page really came to rest in time.
 */
async function settled(page, { clip, max = 7000, gap = 350 } = {}) {
  let last = await page.screenshot({ clip })
  const start = Date.now()
  while (Date.now() - start < max) {
    await page.waitForTimeout(gap)
    const next = await page.screenshot({ clip })
    if (next.equals(last)) return { buffer: next, settled: true }
    last = next
  }
  return { buffer: last, settled: false }
}

// ---------- the home page ----------

/** The names of the home page's states, in order, for a gallery of `slides` sites. */
function homeNames(slides) {
  return [
    'hero',
    'skills',
    ...CARDS.map((name) => `stack-${name}`),
    'stack-engine-hover',
    ...Array.from({ length: slides }, (_, i) => `gallery-${i + 1}`),
    'gallery-open',
    'frames-first',
    'frames-bery',
    'frames-last',
    'footer-letters',
    'footer-end',
    'menu-open',
    'about-open',
    'contact-open',
    'contact-open-zoom',
  ]
}

/**
 * Where to scroll to hold each card of the stack in full view. A card sticks once the empty spacer after it
 * reaches the bottom of the screen; a third of the way through that spacer the card is well at rest and the next
 * one is still out of sight.
 */
function stackTargets(page) {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll('.stack .stack-card')]
    const holds = [...document.querySelectorAll('.stack .stack-hold')]
    return cards.map((card, i) => {
      const hold = holds[i]
      if (!hold) return null
      const holdTop = hold.getBoundingClientRect().top + window.scrollY
      const stuckAt = holdTop - card.offsetHeight - (parseFloat(getComputedStyle(card).top) || 0)
      return { y: stuckAt + hold.offsetHeight * 0.35, title: card.querySelector('h3')?.textContent ?? '' }
    })
  })
}

/** Is the gallery drawn (a canvas), replaced by plain links (no WebGL), or still missing? */
async function galleryKind(page) {
  await page.waitForSelector('#work .work-stage canvas, #work .work-plain', { timeout: 20000 }).catch(() => undefined)
  return page.evaluate(() => (document.querySelector('#work .work-stage canvas') ? 'canvas' : document.querySelector('#work .work-plain') ? 'plain' : 'missing'))
}

const slideNow = (page) => page.evaluate((count) => Number(document.querySelector(count)?.dataset.slide), COUNT)

/** Presses a key on the gallery's stage, the way the page itself listens for it (no focus ring, no real keyboard needed). */
const galleryKey = (page, key) =>
  page.evaluate((name) => {
    const target = name === 'Escape' ? window : document.querySelector('#work .work-stage')
    target?.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }))
  }, key)

/** Opens the panel in the middle the way a visitor does: a click on its screen. */
async function openPanel(page) {
  const point = await page.evaluate(() => {
    const box = document.querySelector('#work .work-stage').getBoundingClientRect()
    return { x: box.left + box.width / 2, y: box.top + box.height * 0.53 }
  })
  await page.mouse.click(point.x, point.y)
}

/**
 * Rests the pointer on the screen of the middle panel. While it is there the row does not move on by itself, so
 * the gallery cannot change between two pictures.
 */
async function holdGallery(page, phone) {
  const point = await page.evaluate(() => {
    const box = document.querySelector('#work .work-stage').getBoundingClientRect()
    return { x: box.left + box.width / 2, y: box.top + box.height * 0.53 }
  })
  // On a phone the real pointer stays where it is: left in the middle of the screen it would later "hover" whatever comes under it.
  if (!phone) await page.mouse.move(point.x, point.y)
  await page.waitForTimeout(120)
  return page.evaluate(({ x, y }) => {
    const stage = document.querySelector('#work .work-stage')
    // A phone has no mouse; the page is told the same thing directly.
    if (stage.dataset.over !== 'screen') stage.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'mouse', clientX: x, clientY: y, bubbles: true }))
    return stage.dataset.over === 'screen'
  }, point)
}

/** Brings slide `wanted` (1 = the first site) into the middle, one arrow key at a time. */
async function gotoSlide(page, wanted, slides) {
  for (let tries = 0; tries < slides * 3; tries++) {
    const now = await slideNow(page)
    if (now === wanted) return true
    const ahead = (((wanted - now) % slides) + slides) % slides
    const forward = ahead <= slides / 2
    const next = ((now - 1 + (forward ? 1 : slides - 1)) % slides) + 1
    await galleryKey(page, forward ? 'ArrowRight' : 'ArrowLeft')
    await page
      .waitForFunction(({ count, n }) => Number(document.querySelector(count)?.dataset.slide) === n, { count: COUNT, n: next }, { timeout: 6000 })
      .catch(() => undefined)
  }
  return (await slideNow(page)) === wanted
}

/**
 * Walks through the side scroll and writes down, for every photo, where the page has to be for that photo to hang
 * in the frame with the opening finished. The side scroll says so itself: --index is whose turn it is, --open is
 * how far the opening has come.
 */
function framesTargets(page) {
  return page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))
    const section = document.querySelector('.frames')
    const stage = document.querySelector('.frames-stage')
    if (!section || !stage) return null
    const top = section.getBoundingClientRect().top + window.scrollY
    const span = section.offsetHeight - window.innerHeight
    const step = window.innerHeight * 0.07
    const ranges = {}
    for (let y = top; y <= top + span; y += step) {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' })
      await frame()
      await frame()
      await frame()
      if (Number(stage.style.getPropertyValue('--open')) < 0.9999) continue
      const index = Number(stage.style.getPropertyValue('--index') || 0)
      ranges[index] ??= { from: window.scrollY, to: window.scrollY }
      ranges[index].to = window.scrollY
    }
    const notes = [...stage.querySelectorAll('.frames-note')]
    return {
      count: notes.length,
      cameo: notes.findIndex((note) => note.hasAttribute('data-big')),
      middles: Object.fromEntries(Object.entries(ranges).map(([index, range]) => [index, (range.from + range.to) / 2])),
    }
  })
}

/** Waits until the row of the side scroll has stopped on photo `index` and its comment is the one shown. */
async function framesAt(page, index) {
  await page
    .waitForFunction(
      (wanted) => {
        const stage = document.querySelector('.frames-stage')
        const note = stage?.querySelectorAll('.frames-note')[wanted]
        return Number(stage?.style.getPropertyValue('--index')) === wanted && Math.abs(Number(stage.style.getPropertyValue('--pos')) - wanted) < 0.001 && note?.hasAttribute('data-on')
      },
      index,
      { timeout: 8000 },
    )
    .catch(() => undefined)
}

/**
 * Is the footer's word drawn (a canvas), set in plain type (no WebGL), set in type in its last state (less motion:
 * nothing is drawn at all), or still missing?
 */
async function footerKind(page) {
  const still = await page.evaluate(() => {
    const word = document.querySelector('.footer-still')
    return Boolean(word) && getComputedStyle(word).display !== 'none'
  })
  if (still) return 'still'
  await page.waitForSelector('.footer-letters canvas, .footer-word', { timeout: 20000 }).catch(() => undefined)
  return page.evaluate(() => (document.querySelector('.footer-letters canvas') ? 'canvas' : document.querySelector('.footer-word') ? 'plain' : 'missing'))
}

/**
 * Finds where in the footer the orange starts to rise (the footer writes --flood on its stage). The word is
 * complete a little before that, so the picture of the letters is taken a fifth of a screen earlier.
 */
function footerWordTarget(page) {
  return page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))
    const section = document.querySelector('.footer')
    const stage = document.querySelector('.footer-stage')
    const top = section.getBoundingClientRect().top + window.scrollY
    let low = top
    let high = top + section.offsetHeight - window.innerHeight
    for (let i = 0; i < 14; i++) {
      const middle = (low + high) / 2
      window.scrollTo({ top: middle, left: 0, behavior: 'instant' })
      await frame()
      await frame()
      await frame()
      if (Number(stage.style.getPropertyValue('--flood')) > 0) high = middle
      else low = middle
    }
    return Math.max(top, low - window.innerHeight * 0.2)
  })
}

/**
 * Presses a button. With the mouse on the wide screens. On the phones the button is told directly that it was
 * pressed: an emulated finger leaves the button looking "hovered" for a while (sometimes, depending on timing), and
 * the pictures must not depend on that.
 */
const press = (page, selector, phone) => (phone ? page.locator(selector).first().evaluate((button) => button.click()) : page.locator(selector).click())

/**
 * Presses `selector` until the page shows `state`. Nothing is pressed if the page is already there, and a press
 * that got lost (it happens while the machine is busy) is made again.
 */
async function pressUntil(page, selector, state, phone) {
  for (let tries = 0; tries < 3; tries++) {
    if (await page.locator(state).count()) return
    await press(page, selector, phone)
    const there = await page.waitForSelector(state, { timeout: 6000 }).then(
      () => true,
      () => false,
    )
    if (there) return
  }
  throw new Error(`Pressing ${selector} never brought up ${state}.`)
}

/** Opens the menu (if it is not open yet). */
const openMenu = (page, phone) => pressUntil(page, '.menu-toggle', '.menu[data-open="true"]', phone)

/** Brings down the About sheet (if it is not down yet); the menu must be open. */
const openAbout = (page, phone) => pressUntil(page, '#menu-links button.menu-link[aria-controls="menu-about"]', '.menu[data-sheet="about"]', phone)

/** Brings down the contact sheet (if it is not down yet); the menu must be open. */
const openContact = (page, phone) => pressUntil(page, '#menu-links button.menu-link[aria-controls="menu-contact"]', '.menu[data-contact="true"]', phone)

async function closeMenu(page) {
  await page.keyboard.press('Escape')
  await page.waitForSelector('.menu[data-open="false"]', { timeout: 5000 }).catch(() => undefined)
}

/** The rectangle around the letters "K" to "v" of the outlined name, with some air, in page pixels. */
function nameClip(page) {
  return page.evaluate(() => {
    const name = document.querySelector('.menu-name')
    const text = name?.firstChild
    if (!name || !text || text.nodeType !== Node.TEXT_NODE) return null
    const content = text.textContent
    const from = content.indexOf('K')
    const to = content.indexOf('v', Math.max(from, 0))
    const range = document.createRange()
    if (from >= 0 && to > from) {
      range.setStart(text, from)
      range.setEnd(text, to + 1)
    } else range.selectNodeContents(name)
    const box = range.getBoundingClientRect()
    const air = box.height * 0.12
    const x = Math.max(0, box.left - air)
    const y = Math.max(0, box.top - air)
    return {
      x,
      y,
      width: Math.min(window.innerWidth, box.right + air) - x,
      height: Math.min(window.innerHeight, box.bottom + air) - y,
      letters: from >= 0 && to > from ? content.slice(from, to + 1) : content,
    }
  })
}

/**
 * Shoots every state of the home page that is wanted. `shoot(name, take)` saves one picture; `take` returns
 * { buffer, settled, note }.
 */
async function shootHome(page, run, shoot, names) {
  const wanted = (name) => names.includes(name) && (!run.only || run.only.has(name))
  const anyWanted = (prefix) => names.some((name) => name.startsWith(prefix) && wanted(name))
  const calm = run.motion === 'reduce'
  const still = () => settled(page)
  const after = async (ms) => {
    await page.waitForTimeout(ms)
    return { buffer: await page.screenshot(), settled: true }
  }

  // The opening plays once after the page arrives; its last part (the orange full stop) lands about 2.7 s in.
  if (wanted('hero')) {
    await page.waitForTimeout(calm ? 500 : 3400)
    // The orange dot beside the status line pulses for ever, so the picture is taken as it is.
    await shoot('hero', () => (calm ? still() : after(0)))
  }

  // ----- the stack: the skills card, then the three cards of names -----
  if (wanted('skills') || anyWanted('stack-')) {
    const targets = await stackTargets(page)
    const cardShot = async (name, index) => {
      if (!wanted(name)) return
      await shoot(name, async () => {
        const target = targets[index]
        if (!target) throw new Error(`The page has no card number ${index + 1} in the stack.`)
        await scrollToY(page, target.y)
        await page.waitForTimeout(calm ? 150 : 500)
        return { ...(await still()), note: target.title }
      })
    }
    await cardShot('skills', 0)
    for (const [i, name] of CARDS.entries()) await cardShot(`stack-${name}`, i + 1)

    if (wanted('stack-engine-hover')) {
      await shoot('stack-engine-hover', async () => {
        const index = CARDS.indexOf('engine') + 1
        await scrollToY(page, targets[index].y)
        await page.waitForTimeout(calm ? 150 : 500)
        // One name near the middle of the wall, a "block" one if there is one (the slab of colour is easy to see).
        const pick = await page.evaluate((card) => {
          const buttons = [...document.querySelectorAll('.stack .stack-card')[card].querySelectorAll('.stack-names button')]
          const middle = (buttons.length - 1) / 2
          const order = buttons.map((_, i) => i).sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle))
          const chosen = order.find((i) => buttons[i].dataset.fx === 'block') ?? order[0]
          const box = buttons[chosen].getBoundingClientRect()
          return { chosen, x: box.left + box.width / 2, y: box.top + box.height / 2, name: buttons[chosen].textContent }
        }, index)
        if (run.viewport.phone) await page.touchscreen.tap(pick.x, pick.y)
        else await page.mouse.move(pick.x, pick.y, { steps: 4 })
        const isOn = () =>
          page.evaluate(({ card, chosen }) => document.querySelectorAll('.stack .stack-card')[card].querySelectorAll('.stack-names button')[chosen].dataset.on === 'true', { card: index, chosen: pick.chosen })
        await page.waitForTimeout(150)
        let how = run.viewport.phone ? 'tapped' : 'hovered'
        if (!(await isOn())) {
          await page.evaluate(({ card, chosen }) => document.querySelectorAll('.stack .stack-card')[card].querySelectorAll('.stack-names button')[chosen].focus({ preventScroll: true }), { card: index, chosen: pick.chosen })
          how = 'focused'
        }
        await page.waitForTimeout(calm ? 150 : 900)
        const result = await still()
        const on = await isOn()
        // Let go again, so the name does not stay lit in later pictures.
        await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur())
        if (!run.viewport.phone) await page.mouse.move(2, run.viewport.height / 2)
        return { ...result, note: `${how} "${pick.name}"${on ? '' : ' (the name did not react)'}` }
      })
    }
  }

  // ----- the work gallery -----
  const slides = names.filter((name) => /^gallery-\d+$/.test(name)).length
  if (anyWanted('gallery-')) {
    const place = await page.evaluate(() => {
      const hold = document.querySelector('.work-hold')
      return hold.getBoundingClientRect().top + window.scrollY + (hold.offsetHeight - window.innerHeight) * 0.3
    })
    await scrollToY(page, place)
    const kind = await galleryKind(page)
    if (kind !== 'canvas') run.notes.push(`gallery: no canvas (${kind}); the pictures show what the page shows instead`)
    // The row slides in when the section first shows (1.5 s), and the pictures on the panels arrive one by one.
    await page.waitForTimeout(calm ? 600 : 2000)
    const held = kind === 'canvas' ? await holdGallery(page, run.viewport.phone) : false
    if (kind === 'canvas' && !held) run.notes.push('gallery: could not rest the pointer on the middle panel, so the row may move on by itself')

    for (let slide = 1; slide <= slides; slide++) {
      const name = `gallery-${slide}`
      if (!wanted(name)) continue
      await shoot(name, async () => {
        const there = kind === 'canvas' ? await gotoSlide(page, slide, slides) : false
        await page.waitForTimeout(calm ? 300 : 1200)
        const result = await settled(page, { max: 20000 })
        const title = await page.evaluate((count) => `${document.querySelector(count)?.dataset.slide} / ${document.querySelector(count)?.dataset.slides} ${document.querySelector('#work .work-head h3')?.textContent?.trim()}`, COUNT)
        return { ...result, note: there ? title : `${title} (could not bring slide ${slide} to the middle)` }
      })
    }

    if (wanted('gallery-open')) {
      await shoot('gallery-open', async () => {
        // Left open by a try that failed: fold it back first.
        if (await page.locator('#work[data-open="true"]').count()) {
          await galleryKey(page, 'Escape')
          await page.waitForTimeout(calm ? 300 : 1500)
        }
        // The last site is opened. On a local address it shows a picture of itself, so nothing outside is loaded.
        if (kind === 'canvas') await gotoSlide(page, slides, slides)
        await page.waitForTimeout(calm ? 300 : 1200)
        await openPanel(page)
        await page.waitForSelector('#work[data-flat="true"]', { timeout: 10000 }).catch(() => undefined)
        const inside = await page.evaluate(() => (document.querySelector('#work .work-view iframe') ? 'the live site in a frame' : 'a picture of the site'))
        if (inside === 'the live site in a frame') await page.waitForSelector('#work .work-view iframe[data-ready="true"]', { timeout: 12000 }).catch(() => undefined)
        await waitImages(page, '#work .work-view')
        await page.waitForTimeout(calm ? 300 : 900)
        const result = await settled(page, { max: 8000 })
        const flat = await page.evaluate(() => document.querySelector('#work')?.dataset.flat === 'true')
        const domain = await page.evaluate(() => document.querySelector('#work .work-bar span')?.textContent?.trim())
        await galleryKey(page, 'Escape')
        await page.waitForSelector('#work[data-open="false"]', { timeout: 5000 }).catch(() => undefined)
        await page.waitForTimeout(calm ? 200 : 1300)
        return { ...result, note: `${domain}: ${inside}${flat ? '' : ' (the panel did not open flat)'}` }
      })
    }
  }

  // ----- the side scroll -----
  // With less motion there is no side scroll: the photos stand one under another (.frames-still), and each picture is
  // taken with that photo in the middle of the screen.
  const listed = anyWanted('frames-') && (await page.evaluate(() => {
    const list = document.querySelector('.frames-still')
    return Boolean(list) && getComputedStyle(list).display !== 'none'
  }))
  if (listed) {
    const items = await page.evaluate(() => {
      const all = [...document.querySelectorAll('.frames-still li')]
      return { count: all.length, cameo: all.findIndex((item) => item.querySelector('.frames-note[data-big]')) }
    })
    const cameo = items.cameo >= 0 ? items.cameo : 3
    const stillShot = async (name, index) => {
      if (!wanted(name)) return
      await shoot(name, async () => {
        const y = await page.evaluate((i) => {
          const box = document.querySelectorAll('.frames-still li')[i].getBoundingClientRect()
          return box.top + window.scrollY + box.height / 2 - window.innerHeight / 2
        }, index)
        await scrollToY(page, y)
        await waitImages(page, '.frames-still')
        await page.waitForTimeout(200)
        return { ...(await settled(page, { max: 8000 })), note: `photo ${index + 1} of ${items.count}, the list for less motion` }
      })
    }
    await stillShot('frames-first', 0)
    await stillShot('frames-bery', cameo)
    await stillShot('frames-last', items.count - 1)
  }
  if (anyWanted('frames-') && !listed) {
    const start = await page.evaluate(() => document.querySelector('.frames').getBoundingClientRect().top + window.scrollY)
    await scrollToY(page, start)
    await waitImages(page, '.frames-stage')
    const found = await framesTargets(page)
    const cameo = found.cameo >= 0 ? found.cameo : 3
    if (found.cameo < 0) run.notes.push('frames: no guest photo is marked on the page; photo 4 was used for frames-bery')
    const frameShot = async (name, index, wait) => {
      if (!wanted(name)) return
      await shoot(name, async () => {
        const y = found.middles[index]
        if (y === undefined) throw new Error(`The side scroll never showed photo ${index + 1} while it was walked through.`)
        await scrollToY(page, y)
        await framesAt(page, index)
        await page.waitForTimeout(calm ? 200 : wait)
        const result = await settled(page, { max: 8000 })
        const shown = await page.evaluate(() => document.querySelector('.frames-count')?.textContent?.trim())
        return { ...result, note: `photo ${shown}` }
      })
    }
    await frameShot('frames-first', 0, 1000)
    // The guest's comment comes in beats; its last part (the name) starts 1.15 s after the photo arrives.
    await frameShot('frames-bery', cameo, 2000)
    await frameShot('frames-last', found.count - 1, 1000)
  }

  // ----- the footer -----
  if (anyWanted('footer-')) {
    const top = await page.evaluate(() => document.querySelector('.footer').getBoundingClientRect().top + window.scrollY)
    await scrollToY(page, top)
    const kind = await footerKind(page)
    if (kind === 'still') run.notes.push('footer: the last state in type, for less motion (no canvas, as intended)')
    else if (kind !== 'canvas') run.notes.push(`footer: no canvas (${kind}); the pictures show what the page shows instead`)
    else {
      await page.waitForFunction(() => document.querySelector('.footer-stage').style.getPropertyValue('--flood') !== '', null, { timeout: 15000 }).catch(() => run.notes.push('footer: the letters never started drawing'))
    }

    if (wanted('footer-letters')) {
      await shoot('footer-letters', async () => {
        const y = kind === 'canvas' ? await footerWordTarget(page) : top + run.viewport.height
        await scrollToY(page, y)
        await page.waitForTimeout(calm ? 300 : 900)
        const result = await settled(page, { max: 8000 })
        const flood = await page.evaluate(() => document.querySelector('.footer-stage').style.getPropertyValue('--flood') || '0')
        return { ...result, note: `orange risen ${flood}` }
      })
    }

    if (wanted('footer-end')) {
      await shoot('footer-end', async () => {
        await scrollToY(page, Number.MAX_SAFE_INTEGER)
        if (kind === 'canvas') {
          // How far the black has risen in the letters; the page has written it under two names (--ink, later --fill).
          await page
            .waitForFunction(
              () => {
                const style = document.querySelector('.footer-stage').style
                return Number(style.getPropertyValue('--fill') || style.getPropertyValue('--ink')) >= 1 && document.querySelector('.footer').dataset.theme === 'accent'
              },
              null,
              { timeout: 8000 },
            )
            .catch(() => undefined)
        }
        await page.waitForTimeout(calm ? 300 : 900)
        const result = await settled(page, { max: 8000 })
        const ink = await page.evaluate(() => {
          const style = document.querySelector('.footer-stage').style
          return style.getPropertyValue('--fill') || style.getPropertyValue('--ink') || '0'
        })
        return { ...result, note: `black risen ${ink}` }
      })
    }
  }

  // ----- the menu and the contact sheet, over the top of the page -----
  if (wanted('menu-open') || wanted('about-open') || wanted('contact-open')) {
    const phone = run.viewport.phone
    // Parks the pointer where nothing reacts to it.
    const park = () => (phone ? undefined : page.mouse.move(2, run.viewport.height / 2))
    await scrollToY(page, 0)
    await page.waitForTimeout(calm ? 200 : 600)
    if (wanted('menu-open')) {
      await shoot('menu-open', async () => {
        await openMenu(page, phone)
        await park()
        // The hero behind the menu still has its pulsing dot, so the picture is taken after a fixed wait.
        return calm ? still() : after(1300)
      })
    }
    // A build from before the About sheet existed has no such button: the state is left out (its number stays free).
    const hasAbout = await page.locator('#menu-links button.menu-link[aria-controls="menu-about"]').count()
    if (wanted('about-open') && !hasAbout) run.notes.push('about-open: this build has no About sheet in the menu; not shot')
    if (wanted('about-open') && hasAbout) {
      await shoot('about-open', async () => {
        await openMenu(page, phone)
        await openAbout(page, phone)
        await park()
        await page.waitForTimeout(calm ? 300 : 1500)
        return still()
      })
    }
    if (wanted('contact-open')) {
      await shoot('contact-open', async () => {
        await openMenu(page, phone)
        await openContact(page, phone)
        await park()
        await page.waitForTimeout(calm ? 300 : 1500)
        return still()
      })
    }
    await closeMenu(page)
  }
}

/**
 * The close-up of the outlined name, in a browser window of its own that draws three device pixels per page pixel:
 * the contour faults the plan describes (finding 2.1) are a pixel or two wide and vanish at normal sharpness.
 */
async function shootNameZoom(browser, run, shoot) {
  await shoot('contact-open-zoom', async () => {
    const context = await browser.newContext(contextOptions(run, ZOOM))
    try {
      const page = await context.newPage()
      watch(page, run)
      await page.goto(run.base + run.route, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(run.motion === 'reduce' ? 300 : 1200)
      await openMenu(page, run.viewport.phone)
      await openContact(page, run.viewport.phone)
      await page.waitForTimeout(run.motion === 'reduce' ? 300 : 1500)
      const clip = await nameClip(page)
      if (!clip) throw new Error('The contact sheet has no outlined name (.menu-name).')
      const result = await settled(page, { clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height } })
      return { ...result, note: `"${clip.letters}" at ${ZOOM}x` }
    } finally {
      await context.close()
    }
  })
}

// ---------- any other page ----------

async function shootGeneric(page, run, shoot) {
  await page.waitForTimeout(run.motion === 'reduce' ? 500 : 2500)
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const screens = Math.min(Math.max(Math.ceil(height / run.viewport.height), 1), 12)
  for (let i = 0; i < screens; i++) {
    await shoot(i === 0 ? 'top' : `screen-${String(i + 1).padStart(2, '0')}`, async () => {
      await scrollToY(page, i * run.viewport.height)
      await page.waitForTimeout(run.motion === 'reduce' ? 200 : 700)
      return settled(page, { max: 5000 })
    })
  }
  await shoot('full', async () => {
    await scrollToY(page, 0)
    await page.waitForTimeout(300)
    return { buffer: await page.screenshot({ fullPage: true }), settled: true }
  })
}

// ---------- one run: one page, one width, with or without motion ----------

function contextOptions(run, scale = 1) {
  return {
    viewport: { width: run.viewport.width, height: run.viewport.height },
    deviceScaleFactor: scale,
    isMobile: Boolean(run.viewport.phone),
    hasTouch: Boolean(run.viewport.phone),
    reducedMotion: run.motion === 'reduce' ? 'reduce' : 'no-preference',
  }
}

/** Collects what the page complains about. */
function watch(page, run) {
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const where = message.location()?.url
    run.consoleErrors.push(where ? `${message.text()} (${where})` : message.text())
  })
  page.on('pageerror', (error) => run.pageErrors.push(String(error?.stack ?? error).split('\n').slice(0, 3).join(' | ')))
}

/** What draws the 3D parts in this browser: the name of the graphics card, "SwiftShader" for software, or "none". */
const webglName = (page) =>
  page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl')
    if (!gl) return 'none'
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const name = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return name
  })

const routeFolder = (route) => route.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-')
const isHome = (route) => route === '/' || route === '/index.html'

async function runOne(browser, run, options) {
  const started = Date.now()
  const folder = join(options.out, run.motion, String(run.viewport.width), isHome(run.route) ? '' : routeFolder(run.route))
  await mkdir(folder, { recursive: true })
  const context = await browser.newContext(contextOptions(run))
  const page = await context.newPage()
  watch(page, run)

  let order = []
  const shoot = async (name, take) => {
    const number = String(order.indexOf(name) + 1 || order.push(name)).padStart(2, '0')
    const file = join(folder, `${number}-${name}.png`)
    const began = Date.now()
    try {
      // A state that could not be reached is tried once more: on a busy machine a wait can simply run out.
      const { buffer, settled: rested = true, note } = await take().catch(async () => {
        await page.waitForTimeout(1500)
        return take()
      })
      await writeFile(file, buffer)
      run.shots.push({
        route: run.route,
        motion: run.motion,
        width: run.viewport.width,
        height: run.viewport.height,
        name,
        file: relative(options.out, file).replaceAll('\\', '/'),
        settled: rested,
        seconds: Number(((Date.now() - began) / 1000).toFixed(1)),
        ...(note ? { note } : {}),
      })
    } catch (error) {
      run.failed.push(`${name}: ${String(error?.message ?? error).split('\n')[0]}`)
    }
  }

  try {
    const response = await page.goto(run.base + run.route, { waitUntil: 'load' })
    if (response && response.status() >= 400) run.notes.push(`the page answered ${response.status()}`)
    await page.evaluate(() => document.fonts.ready)
    run.webgl = await webglName(page)
    // Which build this is: the name of the page's main script, which changes whenever the code does.
    run.build = await page.evaluate(() => document.querySelector('script[type="module"][src]')?.getAttribute('src')?.split('/').pop() ?? 'unknown')
    if (isHome(run.route) && (await page.locator('#top.hero').count())) {
      // How many sites the gallery has: the page says "01 / 04" under the row.
      const slides = await page.evaluate((count) => Number(document.querySelector(count)?.dataset.slides) || 0, COUNT)
      order = homeNames(slides)
      await shootHome(page, run, shoot, order)
      if (!run.only || run.only.has('contact-open-zoom')) await shootNameZoom(browser, run, shoot)
    } else {
      const generic = async (name, take) => (!run.only || run.only.has(name) ? shoot(name, take) : order.push(name))
      await shootGeneric(page, run, generic)
    }
  } catch (error) {
    run.failed.push(`the run stopped: ${String(error?.message ?? error).split('\n')[0]}`)
  } finally {
    await context.close()
  }
  run.ms = Date.now() - started
  const marks = [run.failed.length ? `${run.failed.length} FAILED` : '', run.consoleErrors.length + run.pageErrors.length ? `${run.consoleErrors.length + run.pageErrors.length} errors` : '']
  console.log(`  ${run.motion.padEnd(6)} ${String(run.viewport.width).padStart(4)}x${String(run.viewport.height).padEnd(4)} ${run.route}  ${run.shots.length} shots, ${(run.ms / 1000).toFixed(0)} s ${marks.filter(Boolean).join(', ')}`)
}

// ---------- everything ----------

const tally = (lines) => {
  const counts = new Map()
  for (const line of lines) counts.set(line, (counts.get(line) ?? 0) + 1)
  return [...counts].map(([text, count]) => ({ text, count }))
}

/**
 * Starts the browser. How it draws the 3D parts is the `gpu` choice:
 *   auto      the graphics card when the machine has one (fast: the gallery runs at full speed), software if not
 *   software  always in software. Slow (the gallery runs at a few frames a second, so a run takes about twice as
 *             long), but it draws the same on every machine
 */
async function launch(channel, gpu) {
  const args = gpu === 'software' ? ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] : ['--enable-unsafe-swiftshader']
  try {
    return await chromium.launch({ channel, headless: true, args })
  } catch (error) {
    const other = channel === 'msedge' ? 'chrome' : 'msedge'
    console.warn(`Could not start ${channel} (${String(error?.message ?? error).split('\n')[0]}); trying ${other}.`)
    return chromium.launch({ channel: other, headless: true, args })
  }
}

/**
 * Writes the list of everything shot. It is written again after every run, so a run that is cut short still leaves
 * a true list. A partial run (--only, fewer widths) keeps what the folder already had.
 */
async function saveManifest(options, base, runs) {
  const manifestPath = join(options.out, 'manifest.json')
  const before = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : { shots: [], runs: [] }
  const shotKey = (shot) => `${shot.route}|${shot.motion}|${shot.width}|${shot.name}`
  const runKey = (run) => `${run.route}|${run.motion}|${run.width}`
  const shots = new Map((before.shots ?? []).map((shot) => [shotKey(shot), shot]))
  const summaries = new Map((before.runs ?? []).map((run) => [runKey(run), run]))
  for (const run of runs) {
    for (const shot of run.shots) shots.set(shotKey(shot), shot)
    summaries.set(runKey({ ...run, width: run.viewport.width }), {
      route: run.route,
      motion: run.motion,
      width: run.viewport.width,
      height: run.viewport.height,
      shots: run.shots.length,
      only: run.only ? [...run.only] : null,
      seconds: Math.round(run.ms / 1000),
      consoleErrors: tally(run.consoleErrors),
      pageErrors: tally(run.pageErrors),
      webgl: run.webgl,
      build: run.build,
      notes: run.notes,
      failed: run.failed,
    })
  }
  const order = (a, b) => a.route.localeCompare(b.route) || a.motion.localeCompare(b.motion) || b.width - a.width
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: base,
    shots: [...shots.values()].sort((a, b) => order(a, b) || a.file.localeCompare(b.file)),
    runs: [...summaries.values()].sort(order),
  }
  await mkdir(dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return manifestPath
}

async function main() {
  const options = readOptions()
  const server = options.url ? null : await serveDist(options.dist)
  const base = options.url ?? server.url
  const started = Date.now()

  const runs = []
  for (const route of options.routes)
    for (const motion of options.motions)
      for (const viewport of options.viewports) runs.push({ base, route, motion, viewport, only: options.only, shots: [], consoleErrors: [], pageErrors: [], notes: [], failed: [], webgl: 'unknown', build: 'unknown', ms: 0 })

  const jobs = Math.min(options.jobs, runs.length)
  console.log(`qa-shots: ${runs.length} runs on ${base}, ${jobs} at a time, into ${relative(root, options.out) || '.'}`)
  const done = []
  let saving = Promise.resolve()
  try {
    const waiting = [...runs]
    await Promise.all(
      Array.from({ length: jobs }, async () => {
        // A browser of its own for every job: the 3D parts are drawn in software by one process per browser, and
        // pages that share a browser wait for each other there.
        const browser = await launch(options.channel, options.gpu)
        try {
          for (let run = waiting.shift(); run; run = waiting.shift()) {
            await runOne(browser, run, options)
            done.push(run)
            saving = saving.then(() => saveManifest(options, base, [...done]))
            await saving
          }
        } finally {
          await browser.close()
        }
      }),
    )
  } finally {
    await server?.close()
  }
  const manifestPath = await saveManifest(options, base, runs)

  // What happened, in a few lines.
  const written = runs.reduce((sum, run) => sum + run.shots.length, 0)
  const unsettled = runs.flatMap((run) => run.shots.filter((shot) => !shot.settled).map((shot) => shot.file))
  const failed = runs.flatMap((run) => run.failed.map((line) => `${run.motion}/${run.viewport.width} ${run.route} ${line}`))
  const notes = runs.flatMap((run) => run.notes.map((line) => `${run.motion}/${run.viewport.width} ${run.route} ${line}`))
  const consoleErrors = tally(runs.flatMap((run) => run.consoleErrors))
  const pageErrors = tally(runs.flatMap((run) => run.pageErrors))

  console.log(`\n${written} pictures written in ${((Date.now() - started) / 1000).toFixed(0)} s. List: ${relative(root, manifestPath)}`)
  const builds = tally(runs.map((run) => run.build))
  console.log(`Build shot: ${builds.map((e) => `${e.text} (${e.count} runs)`).join('; ')}${builds.length > 1 ? '  <-- MORE THAN ONE BUILD: the site changed while it was being shot' : ''}`)
  console.log(`3D drawn by: ${tally(runs.map((run) => run.webgl)).map((e) => `${e.text} (${e.count} runs)`).join('; ')}`)
  if (unsettled.length) console.log(`\nStill moving when shot (${unsettled.length}):\n${unsettled.map((file) => `  ${file}`).join('\n')}`)
  if (notes.length) console.log(`\nNotes (${notes.length}):\n${notes.map((line) => `  ${line}`).join('\n')}`)
  console.log(consoleErrors.length ? `\nConsole errors:\n${consoleErrors.map((e) => `  ${e.count}x ${e.text}`).join('\n')}` : '\nConsole errors: none')
  console.log(pageErrors.length ? `\nPage errors:\n${pageErrors.map((e) => `  ${e.count}x ${e.text}`).join('\n')}` : 'Page errors: none')
  if (failed.length) {
    console.log(`\nNOT SHOT (${failed.length}):\n${failed.map((line) => `  ${line}`).join('\n')}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(`qa-shots: ${error?.message ?? error}`)
  process.exitCode = 1
})
