/**
 * Makes the share pictures: what a link to the site shows when it is posted
 * somewhere. One for the home page and one for each case study, 1200 x 630,
 * written to public/og/ (home.png and <slug>.png). The pages name them in
 * their head (see src/case/route.ts).
 *
 *   npm run og
 *
 * Each picture is a small page in the site's own type and colours, drawn in
 * a real browser and photographed: Inter, the charcoal and the orange and
 * their grain read straight from src/styles.css, the name set large and
 * tight with the orange full stop, a small label above it and an orange band
 * along the bottom. The words come from src/content (work.ts, hero.ts), so
 * the pictures never say anything the pages do not. Run it again whenever a
 * project's name, eyebrow or subtitle changes; the files are kept in the
 * repository.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import sharp from 'sharp'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = `${root}public/og/`
const WIDTH = 1200
const HEIGHT = 630

// The words, read from the same files the pages are built from.
const vite = await createServer({ root, logLevel: 'error', appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false } })
const { work } = await vite.ssrLoadModule('/src/content/work.ts')
const { hero } = await vite.ssrLoadModule('/src/content/hero.ts')
const { lookFor } = await vite.ssrLoadModule('/src/case/look.ts')
await vite.close()

// The colours and the grain, read from the stylesheet.
const styles = readFileSync(`${root}src/styles.css`, 'utf8')
const token = (name) => {
  const found = new RegExp(`--${name}:\\s*([^;]+);`).exec(styles)
  if (!found) throw new Error(`src/styles.css has no --${name}.`)
  return found[1].trim()
}
const font = readFileSync(`${root}node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2`).toString('base64')
const two = (n) => String(n).padStart(2, '0')
const text = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;')

const cards = [
  {
    file: 'home',
    ground: 'paper',
    eyebrow: 'Portfolio',
    title: hero.name,
    line: hero.descriptor.join(' · '),
    left: 'khvichia.shemoqmedi.space',
    right: 'Tbilisi, Georgia',
  },
  ...work.map((item) => ({
    file: item.slug,
    // A project whose page opens on charcoal gets a charcoal picture.
    ground: lookFor(item.slug).hero,
    eyebrow: item.eyebrow,
    title: item.title,
    line: item.subtitle,
    left: hero.name,
    right: `Case study ${two(item.index)} / ${two(work.length)}`,
  })),
]

const page = (card) => `<!doctype html>
<html lang="en">
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'Inter Variable'; font-weight: 100 900; src: url(data:font/woff2;base64,${font}) format('woff2-variations'); }
  :root {
    --paper: ${token('paper')}; --ink: ${token('ink')}; --accent: ${token('accent')};
    --mono: ${token('mono')};
    --grain-pale: ${token('grain-pale')};
    --grain-dark: ${token('grain-dark')};
  }
  * { box-sizing: border-box; margin: 0; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden;
    display: flex; flex-direction: column;
    font-family: 'Inter Variable', system-ui, sans-serif;
    color: var(--ink); background: var(--paper);
    --line: rgb(28 28 28 / 0.08); --soft: #696969;
    -webkit-font-smoothing: antialiased;
  }
  body[data-ground='ink'] { color: var(--paper); background: var(--grain-pale) var(--ink); --line: rgb(255 255 255 / 0.09); --soft: rgb(255 255 255 / 0.66); }
  .lines { position: absolute; inset: 0 56px; display: grid; grid-template-columns: repeat(4, 1fr); }
  .lines i { border-left: 1px solid var(--line); }
  .lines i:first-child { border: 0; }
  .top { position: relative; display: flex; align-items: center; gap: 22px; padding: 44px 56px 0; }
  .gk { display: grid; place-items: center; width: 52px; height: 52px; color: var(--paper); background: var(--ink); font-size: 19px; font-weight: 700; letter-spacing: -0.04em; }
  body[data-ground='ink'] .gk { color: var(--ink); background: var(--paper); }
  .mono { font-family: var(--mono); font-size: 17px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; }
  .eyebrow { display: flex; align-items: center; gap: 14px; color: var(--soft); }
  .eyebrow::before { content: ''; width: 10px; height: 10px; background: var(--accent); }
  .words { position: relative; margin-top: auto; padding: 0 56px 40px; }
  h1 { margin-left: -0.045em; font-size: 236px; font-weight: 600; line-height: 0.96; letter-spacing: -0.055em; white-space: nowrap; }
  h1 b { font-weight: inherit; color: var(--accent); }
  .line { margin-top: 18px; font-size: 33px; font-weight: 500; line-height: 1.2; letter-spacing: -0.025em; }
  .band { position: relative; display: flex; align-items: center; justify-content: space-between; height: 92px; padding: 0 56px; color: var(--ink); background: var(--grain-dark) var(--accent); }
</style>
<body data-ground="${card.ground}">
  <div class="lines"><i></i><i></i><i></i><i></i></div>
  <div class="top">
    <span class="gk">GK</span>
    <span class="mono eyebrow">${text(card.eyebrow)}</span>
  </div>
  <div class="words">
    <h1>${text(card.title)}<b>.</b></h1>
    <p class="line">${text(card.line)}</p>
  </div>
  <div class="band">
    <span class="mono">${text(card.left)}</span>
    <span class="mono">${text(card.right)}</span>
  </div>
</body>
</html>`

mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const tab = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 })
for (const card of cards) {
  await tab.setContent(page(card))
  await tab.evaluate(async () => {
    await document.fonts.ready
    // The name is set as large as the picture's width allows, up to the size in the stylesheet.
    const name = document.querySelector('h1')
    const room = document.querySelector('.words').clientWidth - 112
    const size = parseFloat(getComputedStyle(name).fontSize)
    const range = document.createRange()
    range.selectNodeContents(name)
    const width = range.getBoundingClientRect().width
    if (width > room) name.style.fontSize = `${Math.floor((size * room) / width)}px`
  })
  const shot = await tab.screenshot({ type: 'png' })
  // The same picture with a small palette: a third of the weight, and no visible difference at this size.
  const png = await sharp(shot).png({ compressionLevel: 9, palette: true, quality: 100, colours: 256, dither: 0.4, effort: 10 }).toBuffer()
  writeFileSync(`${out}${card.file}.png`, png)
  console.log(`og: public/og/${card.file}.png  ${(png.length / 1024).toFixed(0)} kB`)
}
await browser.close()
