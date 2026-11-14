/**
 * The last step of `npm run build`. It makes the built page show up without
 * waiting for any script:
 *
 *   1. the page is written into dist/index.html as plain HTML (drawn by
 *      src/entry-server.tsx, which the step before this one built into
 *      dist-ssr/); the browser's script then only takes it over,
 *   2. the stylesheet is put inside the HTML, so the first paint needs one
 *      file and not two,
 *   3. the text font is announced at the top, so it starts loading at once.
 */
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = `${root}dist/`
const server = `${root}dist-ssr/`

const { render } = await import(pathToFileURL(`${server}entry-server.js`).href)
let html = readFileSync(`${dist}index.html`, 'utf8')

const EMPTY = '<div id="root"></div>'
if (!html.includes(EMPTY)) throw new Error('index.html has no empty #root to fill.')
const page = render()
html = html.replace(EMPTY, () => `<div id="root">${page}</div>`)

// The stylesheet, inside the page. Its addresses are already absolute (/assets/...), so it reads the same from here.
let inlined = 0
html = html.replace(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/, (_tag, href) => {
  const css = readFileSync(`${dist}${href.slice(1)}`, 'utf8')
  if (/url\(\s*['"]?\.\.?\//.test(css)) throw new Error('The stylesheet has relative addresses; it cannot be moved into the page as it is.')
  inlined = css.length
  return `<style>${css}</style>`
})
if (!inlined) throw new Error('No stylesheet link found in index.html.')

// The font the whole page is set in.
const font = readdirSync(`${dist}assets`).find((name) => /^inter-latin-wght-normal-.*\.woff2$/.test(name))
if (!font) throw new Error('The Inter font file was not found in dist/assets.')
html = html.replace('</title>', () => `</title>\n    <link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${font}" />`)

writeFileSync(`${dist}index.html`, html)
rmSync(server, { recursive: true, force: true })
console.log(`prerendered: page ${(page.length / 1024).toFixed(0)} kB, styles ${(inlined / 1024).toFixed(0)} kB, index.html ${(html.length / 1024).toFixed(0)} kB`)
