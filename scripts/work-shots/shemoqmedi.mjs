// Real screenshots of the live Shemoqmedi site for its case study
// (src/assets/work/shemoqmedi). Public pages only: no sign-in, no admin.
//
//   node scripts/work-shots/shemoqmedi.mjs            every capture
//   node scripts/work-shots/shemoqmedi.mjs home badges   only the named ones
//
// Uses the installed Edge through playwright-core, and sharp for the files:
//   desktop (1440x900 @2x)  <name>-2880.avif, <name>-1440.avif, <name>-1440.webp
//   mobile  (390x844 @3x)   <name>-1170.avif, <name>-780.avif,  <name>-780.webp
//
// The site is live data: the hero slide, the nominees and their countdowns
// change from day to day, so look at the new files before using them.

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'src', 'assets', 'work', 'shemoqmedi');
const ORIGIN = 'https://www.shemoqmedi.space';

/** The site's own listing of Kencho Room: a listing page that is Giorgi's own work. */
const LISTING = '/sites/the-room-by-kencho-group';

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

/** Top of the nearest <section> around the heading with this text, in page pixels. */
const sectionTop = (page, heading) =>
  page.evaluate((text) => {
    const h = [...document.querySelectorAll('h1, h2, h3')].find((el) => el.textContent.trim() === text);
    if (!h) return null;
    const box = (h.closest('section') ?? h).getBoundingClientRect();
    return Math.round(box.top + window.scrollY);
  }, heading);

/** Top of the element whose own text is exactly `label`, in page pixels. */
const labelTop = (page, label) =>
  page.evaluate((text) => {
    const el = [...document.querySelectorAll('body *')].find(
      (n) => n.children.length === 0 && n.textContent.trim().toLowerCase() === text,
    );
    return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null;
  }, label.toLowerCase());

async function scrollTo(page, y) {
  if (y === null) throw new Error('The part of the page to capture was not found: the site has changed.');
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), Math.max(0, y));
}

/**
 * Fonts in, the crow landed in the header (the site's logo is a live crow
 * that flies in after load and marks the wordmark data-crow="home"), every
 * image in the viewport loaded, then real time for the entrance motion.
 */
async function settle(page, ms = 1500) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('[data-crow="home"]', { timeout: 8000 }).catch(() => {});
  await page
    .waitForFunction(
      () =>
        [...document.images]
          .filter((img) => {
            const r = img.getBoundingClientRect();
            return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
          })
          .every((img) => img.complete && img.naturalWidth > 0),
      null,
      { timeout: 20000 },
    )
    .catch(() => {});
  await page.waitForTimeout(ms);
}

/** A cookie banner, if the site ever gets one: only ever the refusing button. */
async function declineCookies(page) {
  const button = page.getByRole('button', { name: /^(decline|reject|refuse|deny|only necessary|necessary only)/i }).first();
  if (await button.isVisible().catch(() => false)) await button.click();
}

const SHOTS = [
  {
    name: 'home',
    kind: 'desktop',
    path: '/',
    // The header slider moves on after six seconds: a short wait keeps the first slide.
    prepare: async (page) => settle(page, 900),
  },
  {
    name: 'nominees',
    kind: 'desktop',
    path: '/',
    prepare: async (page) => {
      await scrollTo(page, (await sectionTop(page, 'Nominees this week')) - 40);
      await settle(page);
    },
  },
  {
    name: 'browse',
    kind: 'desktop',
    path: '/',
    prepare: async (page) => {
      await scrollTo(page, (await sectionTop(page, 'All websites')) - 40);
      await settle(page);
    },
  },
  {
    name: 'listing',
    kind: 'desktop',
    path: LISTING,
    prepare: async (page) => settle(page),
  },
  {
    name: 'scores',
    kind: 'desktop',
    path: LISTING,
    // The details row (categories, built with, made by, listed) and the score card under it.
    prepare: async (page) => {
      await scrollTo(page, (await labelTop(page, 'Built with')) - 150);
      await settle(page);
    },
  },
  {
    name: 'badges',
    kind: 'desktop',
    path: '/badges',
    prepare: async (page) => {
      await scrollTo(page, (await labelTop(page, 'The four awards')) - 120);
      await settle(page);
    },
  },
  {
    name: 'home-mobile',
    kind: 'mobile',
    path: '/',
    prepare: async (page) => settle(page, 900),
  },
  {
    name: 'browse-mobile',
    kind: 'mobile',
    path: '/',
    prepare: async (page) => {
      await scrollTo(page, (await sectionTop(page, 'All websites')) - 20);
      await settle(page);
    },
  },
];

/** Writes the three files of one capture and returns the largest one's size. */
async function save(png, name, kind) {
  const [large, small] = kind === 'desktop' ? [2880, 1440] : [1170, 780];
  const meta = await sharp(png).metadata();
  if (meta.width !== large) throw new Error(`${name}: expected a ${large}px wide capture, got ${meta.width}px.`);
  const half = () => sharp(png).resize({ width: small, kernel: 'lanczos3' });
  await sharp(png).avif({ quality: 55, effort: 9 }).toFile(path.join(OUT, `${name}-${large}.avif`));
  await half().avif({ quality: 55, effort: 9 }).toFile(path.join(OUT, `${name}-${small}.avif`));
  await half().webp({ quality: 80, effort: 6 }).toFile(path.join(OUT, `${name}-${small}.webp`));
  return { width: meta.width, height: meta.height };
}

const only = process.argv.slice(2);
const unknown = only.filter((name) => !SHOTS.some((s) => s.name === name));
if (unknown.length > 0) {
  console.error(`Unknown capture: ${unknown.join(', ')}. Known: ${SHOTS.map((s) => s.name).join(', ')}.`);
  process.exit(1);
}
const wanted = SHOTS.filter((s) => only.length === 0 || only.includes(s.name));

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
});
try {
  for (const shot of wanted) {
    // A new context per capture: nothing carries over (scroll, menu, storage).
    const context = await browser.newContext({ ...(shot.kind === 'desktop' ? DESKTOP : MOBILE), locale: 'en-US' });
    const page = await context.newPage();
    const response = await page.goto(ORIGIN + shot.path, { waitUntil: 'load', timeout: 60000 });
    if (!response || !response.ok()) throw new Error(`${shot.path} answered ${response?.status() ?? 'nothing'}.`);
    if (new URL(page.url()).pathname !== shot.path) throw new Error(`${shot.path} redirected to ${page.url()}.`);
    await declineCookies(page);
    await shot.prepare(page);
    const png = await page.screenshot({ type: 'png' });
    const size = await save(png, shot.name, shot.kind);
    console.log(`${shot.name}: ${size.width}x${size.height}`);
    await context.close();
  }
} finally {
  await browser.close();
}
