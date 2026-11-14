/**
 * Prints the CV as PDFs, in the look of the site: white paper, charcoal type,
 * one orange accent, a narrow column of labels beside the text.
 *
 *   npm run cv
 *
 * The words are in scripts/cv-content.mjs (English and Georgian). Each
 * version becomes public/cv/<file>.pdf, which the site's "Download my CV"
 * button points at. The page is built as HTML here and printed by the Edge
 * that comes with Windows, so nothing else needs installing.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { cv } from './cv-content.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = join(root, 'public', 'cv')

const browser = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync)
if (!browser) throw new Error('Neither Edge nor Chrome was found; one of them is needed to print the PDF.')

/** The fonts travel inside the page, so the print never waits for a file. */
const font = (path) => readFileSync(join(root, 'node_modules', path)).toString('base64')
const fonts = `
  @font-face { font-family: Inter; font-weight: 100 900; src: url(data:font/woff2;base64,${font('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}) format('woff2'); }
  @font-face { font-family: 'Noto Sans Georgian'; font-weight: 100 900; src: url(data:font/woff2;base64,${font('@fontsource-variable/noto-sans-georgian/files/noto-sans-georgian-georgian-wght-normal.woff2')}) format('woff2'); }
`

/** Waits without doing anything. */
const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const two = (n) => String(n).padStart(2, '0')
const site = (address) => `<a href="https://${esc(address)}">${esc(address)}</a>`

function page(c) {
  let number = 0
  const section = (label, body, key) => `
    <section${c.newPage?.includes(key) ? ' class="fresh"' : ''}>
      <h2><i>${two(++number)}</i>${esc(label)}</h2>
      <div>${body}</div>
    </section>`
  const head = (title, date) => `<div class="head"><h3>${title}</h3>${date ? `<time>${esc(date)}</time>` : ''}</div>`

  return `<!doctype html>
<html lang="${c.lang}">
<head>
<meta charset="utf-8">
<title>${esc(c.name)} · CV</title>
<style>
${fonts}
@page {
  size: A4;
  margin: 15mm 16mm 17mm;
  @bottom-left { content: "${c.footer}"; font: 500 7.4pt Inter, 'Noto Sans Georgian', sans-serif; color: #8c8c8c; }
  @bottom-right { content: counter(page) " / " counter(pages); font: 500 7.4pt Inter, sans-serif; color: #8c8c8c; }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font: 400 9.3pt/1.52 Inter, 'Noto Sans Georgian', sans-serif; color: #1c1c1c; font-feature-settings: 'cv11', 'ss03'; }
a { color: inherit; text-decoration: none; }
ul { list-style: none; }

/* The top: the name with the orange full stop, what he is, and how to reach him. */
header { display: grid; grid-template-columns: 1fr auto; column-gap: 10mm; align-items: end; padding-bottom: 6.5mm; border-bottom: 1.1pt solid #1c1c1c; }
h1 { font-size: 33pt; font-weight: 650; line-height: 1; letter-spacing: -0.045em; }
h1 b { font-weight: inherit; color: #ff4d00; }
.role { margin-top: 3.4mm; font-size: 11.4pt; font-weight: 600; letter-spacing: -0.015em; }
.sub { margin-top: 0.8mm; font-size: 9pt; color: #6a6a6a; }
.reach { font-size: 8.3pt; line-height: 1.58; text-align: right; color: #3a3a3a; font-variant-numeric: tabular-nums; }
.reach li:first-child { font-weight: 600; color: #1c1c1c; }

/* A section: its number and name in a narrow column on the left, its text on the right. */
section { display: grid; grid-template-columns: 36mm 1fr; column-gap: 7mm; padding-top: 4.6mm; margin-top: 4.6mm; border-top: 0.5pt solid #d2d2d2; }
section:first-of-type { border-top: 0; margin-top: 1.4mm; }
/* A section named in the version's \`newPage\` list starts a new page, so it is not cut in two at the foot of the one before. */
section.fresh { break-before: page; border-top: 0; margin-top: 0; padding-top: 0; }
h2 { font-size: 7.3pt; font-weight: 650; line-height: 1.4; letter-spacing: 0.09em; text-transform: uppercase; break-after: avoid; }
h2 i { display: block; margin-bottom: 0.9mm; font-style: normal; color: #ff4d00; letter-spacing: 0.06em; font-variant-numeric: tabular-nums; }

.entry { break-inside: avoid; }
.entry + .entry { margin-top: 3.9mm; }
.head { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; }
h3 { font-size: 10.3pt; font-weight: 650; line-height: 1.3; letter-spacing: -0.012em; }
h3 a, .lead a { font-weight: 400; color: #6a6a6a; }
time { flex: none; font-size: 8.3pt; color: #6a6a6a; white-space: nowrap; font-variant-numeric: tabular-nums; }
.meta { font-size: 8.7pt; color: #6a6a6a; }
.entry p + p, .entry .points { margin-top: 1.3mm; }
.tech { font-size: 8.7pt; }
.tech b, .lead b, dt { font-weight: 650; }

/* A point: a small orange square, then a bold lead and the text. */
.points li { position: relative; padding-left: 4.4mm; break-inside: avoid; }
.points li + li { margin-top: 1.7mm; }
.points li::before { content: ''; position: absolute; left: 0; top: 0.62em; width: 1.5mm; height: 1.5mm; background: #ff4d00; }
.lead { display: block; }

/* Two columns of the same text: what, and the details. */
dl { display: grid; grid-template-columns: 39mm 1fr; column-gap: 5mm; row-gap: 1.7mm; }
dt { font-size: 8.9pt; line-height: 1.45; padding-top: 0.15mm; }
dd { break-inside: avoid; }

:lang(ka) h1 { font-size: 30pt; letter-spacing: -0.01em; font-weight: 700; }
:lang(ka) h2 { letter-spacing: 0.05em; }
:lang(ka) body { line-height: 1.56; }
</style>
</head>
<body>
<header>
  <div>
    <h1>${esc(c.name)}<b>.</b></h1>
    <p class="role">${esc(c.role)}</p>
    <p class="sub">${esc(c.sub)}</p>
  </div>
  <ul class="reach">
    ${c.reach.map((line) => `<li>${line.href ? `<a href="${esc(line.href)}">${esc(line.text)}</a>` : esc(line.text)}</li>`).join('\n    ')}
  </ul>
</header>

${section(c.profile.label, `<p>${esc(c.profile.text)}</p>`)}

${section(
  c.experience.label,
  `<div class="entry">
    ${head(esc(c.experience.title), c.experience.date)}
    <p class="meta">${esc(c.experience.meta)}</p>
    <ul class="points">
      ${c.experience.points
        .map((point) => `<li><span class="lead"><b>${esc(point.lead)}</b>${point.link ? ` · ${site(point.link)}` : ''}</span>${esc(point.text)}</li>`)
        .join('\n      ')}
    </ul>
  </div>`,
)}

${section(
  c.projects.label,
  c.projects.items
    .map(
      (item) => `<div class="entry">
    ${head(`${esc(item.title)} · ${site(item.link)}`, item.date)}
    <p class="meta">${esc(item.meta)}</p>
    <p>${esc(item.text)}</p>
    ${item.tech ? `<p class="tech"><b>${esc(c.projects.techLabel)}:</b> ${esc(item.tech)}</p>` : ''}
  </div>`,
    )
    .join('\n'),
)}

${section(
  c.education.label,
  c.education.items
    .map(
      (item) => `<div class="entry">
    ${head(esc(item.title), item.date)}
    ${item.lines.map((line, i) => `<p${i ? ' class="meta"' : ''}>${esc(line)}</p>`).join('')}
  </div>`,
    )
    .join('\n'),
  'education',
)}

${section(
  c.awards.label,
  c.awards.items
    .map(
      (item) => `<div class="entry">
    ${head(esc(item.title), item.date)}
    <p>${esc(item.text)}</p>
  </div>`,
    )
    .join('\n'),
)}

${section(c.skills.label, `<dl>${c.skills.rows.map(([name, text]) => `<dt>${esc(name)}</dt><dd>${esc(text)}</dd>`).join('')}</dl>`)}

${section(c.languages.label, `<dl>${c.languages.rows.map(([name, text]) => `<dt>${esc(name)}</dt><dd>${esc(text)}</dd>`).join('')}</dl>`)}
</body>
</html>`
}

mkdirSync(out, { recursive: true })
const work = mkdtempSync(join(tmpdir(), 'cv-'))
try {
  for (const version of Object.values(cv)) {
    const html = join(work, `${version.lang}.html`)
    const pdf = join(out, version.file)
    writeFileSync(html, page(version))
    rmSync(pdf, { force: true })
    execFileSync(
      browser,
      ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=4000', `--user-data-dir=${join(work, `profile-${version.lang}`)}`, `--print-to-pdf=${pdf}`, pathToFileURL(html).href],
      { stdio: 'ignore' },
    )
    // On Windows the browser hands the job to another process and returns at once, so wait until the file is there and has stopped growing.
    let size = -1
    for (let tries = 0; tries < 120; tries++) {
      pause(250)
      const now = existsSync(pdf) ? statSync(pdf).size : -1
      if (now > 0 && now === size) break
      size = now
    }
    if (size <= 0) throw new Error(`The browser did not write ${version.file}.`)
    console.log(`${version.file}  ${(size / 1024).toFixed(0)} kB`)
  }
} finally {
  // The browser may still be closing its profile folder; leftovers in the temp folder do no harm.
  try {
    rmSync(work, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 })
  } catch {
    /* left for the system to clear */
  }
}
