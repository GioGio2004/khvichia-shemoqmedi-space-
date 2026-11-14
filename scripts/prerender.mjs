/**
 * The last step of `npm run build`. It writes every page of the site into
 * its own finished HTML file, so each one shows up without waiting for any
 * script:
 *
 *   /                 dist/index.html              (from the built index.html)
 *   /work/<slug>      dist/work/<slug>/index.html  (from the built case.html)
 *   anything else     dist/404.html                (from the built case.html)
 *
 * For each page:
 *
 *   1. the page is written into the HTML as plain markup (drawn by
 *      src/entry-server.tsx, which the step before this one built into
 *      dist-ssr/); the browser's script then only takes it over,
 *   2. the stylesheets are put inside the HTML, so the first paint needs one
 *      file and not several,
 *   3. the text font is announced at the top, so it starts loading at once,
 *   4. the head gets what the page says about itself: a case study gets its
 *      own title, description, address and share picture; the home page keeps
 *      the head written in index.html and only gains the share picture.
 *
 * It also writes the "Case studies" part of dist/llms.txt from work.ts (the
 * rest of that file is public/llms.txt as it stands).
 *
 * dist/case.html itself is only the mould for those pages and is removed at
 * the end.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = `${root}dist/`
const server = `${root}dist-ssr/`

const { render, paths, caseLines } = await import(pathToFileURL(`${server}entry-server.js`).href)

const EMPTY = '<div id="root"></div>'
const kB = (text) => `${(text.length / 1024).toFixed(0)} kB`
const attr = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const meta = (key, name, content) => `<meta ${key}="${name}" content="${attr(content)}" />`

// The font the whole site is set in.
const font = readdirSync(`${dist}assets`).find((name) => /^inter-latin-wght-normal-.*\.woff2$/.test(name))
if (!font) throw new Error('The Inter font file was not found in dist/assets.')
const preload = `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${font}" />`

// The two built moulds, read once before anything is written over them.
const shells = { 'index.html': readFileSync(`${dist}index.html`, 'utf8'), 'case.html': readFileSync(`${dist}case.html`, 'utf8') }

/** Puts every stylesheet the page links to inside the page. Their addresses are already absolute (/assets/...), so they read the same from there. */
function inlineStyles(html, file) {
  let size = 0
  const out = html.replace(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g, (_tag, href) => {
    const css = readFileSync(`${dist}${href.slice(1)}`, 'utf8')
    if (/url\(\s*['"]?\.\.?\//.test(css)) throw new Error(`${href} has relative addresses; it cannot be moved into the page as it is.`)
    size += css.length
    return `<style>${css}</style>`
  })
  if (!size) throw new Error(`No stylesheet link found in ${file}.`)
  return [out, size]
}

/** What the page says about how it is shared: the picture, and the kind of card to show it in. */
function shareTags(share) {
  return [
    meta('property', 'og:site_name', share.siteName),
    meta('property', 'og:image', share.image),
    meta('property', 'og:image:type', 'image/png'),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', share.imageAlt),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:image', share.image),
  ]
}

/** The whole head of a page that is not the home page. */
function headTags(head, share) {
  return [
    `<title>${attr(head.title)}</title>`,
    preload,
    meta('name', 'description', head.description),
    head.index ? null : meta('name', 'robots', 'noindex'),
    head.canonical ? `<link rel="canonical" href="${attr(head.canonical)}" />` : null,
    meta('property', 'og:type', head.type),
    meta('property', 'og:title', head.title),
    meta('property', 'og:description', head.description),
    head.canonical ? meta('property', 'og:url', head.canonical) : null,
    ...shareTags(share),
    meta('name', 'twitter:title', head.title),
    meta('name', 'twitter:description', head.description),
  ].filter(Boolean)
}

// Every share picture a page names must be there (they are made by `npm run og` and kept in public/og/).
const missingPictures = new Set()

for (const path of paths) {
  const page = render(path)
  let html = shells[page.shell]
  if (!html.includes(EMPTY)) throw new Error(`${page.shell} has no empty #root to fill.`)
  html = html.replace(EMPTY, () => `<div id="root">${page.html}</div>`)

  const [withStyles, styles] = inlineStyles(html, page.shell)
  html = withStyles

  if (page.head) {
    // A case study or the "not found" page: the mould has only a placeholder title.
    const title = /<title>[^<]*<\/title>/
    if (!title.test(html)) throw new Error(`${page.shell} has no <title> to replace.`)
    html = html.replace(title, () => headTags(page.head, page.share).join('\n    '))
  } else {
    // The home page: its head stays as index.html has it, with the font and the share picture added. They go right
    // under the title, before the stylesheet that is put inside the page: a link preview reads only the start of a page.
    html = html.replace('</title>', () => `</title>\n    ${[preload, ...shareTags(page.share)].join('\n    ')}`)
  }

  const picture = new URL(page.share.image).pathname
  if (!existsSync(`${dist}${picture.slice(1)}`)) missingPictures.add(picture)

  const file = `${dist}${page.file}`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  console.log(`prerendered ${path.padEnd(22)} ${page.file.padEnd(32)} page ${kB(page.html)}, styles ${(styles / 1024).toFixed(0)} kB, file ${kB(html)}`)
}

// llms.txt: the lines under "## Case studies" are replaced by the ones made from work.ts.
const llms = readFileSync(`${dist}llms.txt`, 'utf8').replace(/\r\n/g, '\n')
const section = /(## Case studies\n\n)(?:- .*\n)+/
if (!section.test(llms)) throw new Error('public/llms.txt has no "## Case studies" list to fill.')
writeFileSync(`${dist}llms.txt`, llms.replace(section, (_all, heading) => `${heading}${caseLines.join('\n')}\n`))
console.log(`llms.txt               ${caseLines.length} case-study lines written from work.ts`)

rmSync(`${dist}case.html`, { force: true })
rmSync(server, { recursive: true, force: true })

if (missingPictures.size) {
  throw new Error(`These share pictures are named in the pages but are not in public/: ${[...missingPictures].join(', ')}. Run "npm run og" and build again.`)
}
