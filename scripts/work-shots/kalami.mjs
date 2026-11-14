// Real screenshots of the live Kalami sites for its case study
// (src/assets/work/kalami). Public pages only: the student landing page
// (www.kalami.space) and the staff landing page (staff.kalami.space).
// Nothing here signs in, and no page behind the sign-in is opened.
//
//   node scripts/work-shots/kalami.mjs                 every capture
//   node scripts/work-shots/kalami.mjs home sandbox    only the named ones
//
// Uses the installed Edge through playwright-core, and sharp for the files:
//   desktop (1440x900 @2x)  <name>-2880.avif, <name>-1440.avif, <name>-1440.webp
//   mobile  (390x844 @3x)   <name>-1170.avif, <name>-780.avif,  <name>-780.webp
//
// The product views on both landing pages are the site's own illustrations
// (the page labels them "Illustrative product view"): the names and numbers in
// them are sample text written in the landing page's code, not anyone's records.
// The real student and staff screens wait for a demo account (owner decision D8).

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'src', 'assets', 'work', 'kalami');
const STUDENT = 'https://www.kalami.space/';
const STAFF = 'https://staff.kalami.space/';

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

/**
 * Where to scroll so the card around the heading with this text sits in the
 * middle of the screen. The card is the nearest block around the heading that
 * is at least `minHeight` tall (the heading with its product view). A card
 * taller than the screen is shown from its top, just under the floating menu.
 */
const cardCentre = (page, heading, minHeight = 480) =>
  page.evaluate(
    ({ text, minHeight }) => {
      const h = [...document.querySelectorAll('h1, h2, h3')].find((el) => el.textContent.trim() === text);
      if (!h) return null;
      let card = h.parentElement;
      while (card && card.offsetHeight < minHeight) card = card.parentElement;
      if (!card) return null;
      const box = card.getBoundingClientRect();
      const menu = 84; // the floating menu covers this much of the top
      const room = window.innerHeight - menu;
      const top = box.top + window.scrollY;
      return Math.round(box.height >= room ? top - menu - 12 : top - menu - (room - box.height) / 2);
    },
    { text: heading, minHeight },
  );

/** Top of a section, in page pixels, moved by `shift` (positive = further down the page). */
const sectionTop = (page, selector, shift = 0) =>
  page.evaluate(
    ({ selector, shift }) => {
      const el = document.querySelector(selector);
      return el ? Math.round(el.getBoundingClientRect().top + window.scrollY + shift) : null;
    },
    { selector, shift },
  );

/** Walks down the page in steps, so everything that appears on scroll has appeared, then stops at `y`. */
async function walkTo(page, y) {
  if (y === null) throw new Error('The part of the page to capture was not found: the site has changed.');
  const target = Math.max(0, y);
  let now = await page.evaluate(() => window.scrollY);
  while (now < target) {
    now = Math.min(target, now + 300);
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), now);
    await page.waitForTimeout(120);
  }
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), target);
}

/** Fonts in, every image on screen loaded, then real time for the entrance motion. */
async function settle(page, ms = 2500) {
  await page.evaluate(() => document.fonts.ready);
  await page
    .waitForFunction(
      () =>
        [...document.images]
          .filter((img) => {
            const box = img.getBoundingClientRect();
            return box.bottom > 0 && box.top < window.innerHeight;
          })
          .every((img) => img.complete && img.naturalWidth > 0),
      undefined,
      { timeout: 15000 },
    )
    .catch(() => {});
  await page.waitForTimeout(ms);
}

/** Says no to a cookie banner if the site ever grows one (it has none today). */
async function declineCookies(page) {
  const button = page.getByRole('button', { name: /^(decline|reject|reject all|only necessary|necessary only)$/i });
  if (await button.first().isVisible().catch(() => false)) {
    await button.first().click();
    await page.waitForTimeout(500);
  }
}

const SHOTS = [
  {
    name: 'home',
    kind: 'desktop',
    url: STUDENT,
    // The pen in the hero draws for a few seconds after the page opens.
    go: async (page) => settle(page, 7000),
  },
  {
    name: 'sandbox',
    kind: 'desktop',
    url: STUDENT,
    go: async (page) => {
      await walkTo(page, await cardCentre(page, 'Learn by doing the thing.'));
      await settle(page);
    },
  },
  {
    name: 'live-class',
    kind: 'desktop',
    url: STUDENT,
    go: async (page) => {
      await walkTo(page, await cardCentre(page, 'See where support matters.'));
      await settle(page);
    },
  },
  {
    name: 'levels',
    kind: 'desktop',
    url: STUDENT,
    go: async (page) => {
      await walkTo(page, await sectionTop(page, '#levels', -110));
      await settle(page);
    },
  },
  {
    name: 'staff',
    kind: 'desktop',
    url: STAFF,
    go: async (page) => settle(page, 6000),
  },
  {
    name: 'studio',
    kind: 'desktop',
    url: STAFF,
    go: async (page) => {
      await walkTo(page, await sectionTop(page, '#tools', 40));
      await settle(page);
    },
  },
  {
    name: 'home-mobile',
    kind: 'mobile',
    url: STUDENT,
    go: async (page) => settle(page, 7000),
  },
  {
    name: 'notebook-mobile',
    kind: 'mobile',
    url: STUDENT,
    go: async (page) => {
      await walkTo(page, await cardCentre(page, 'Find your starting point.'));
      await settle(page);
    },
  },
];

/** One capture: its own page, a viewport screenshot, then the three files. */
async function capture(context, shot) {
  const page = await context.newPage();
  try {
    await page.goto(shot.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
    await declineCookies(page);
    await shot.go(page);
    const png = await page.screenshot({ type: 'png' });
    const [full, half] = shot.kind === 'desktop' ? [2880, 1440] : [1170, 780];
    const small = await sharp(png).resize({ width: half }).png().toBuffer();
    const base = path.join(OUT, shot.name);
    await sharp(png).avif({ quality: 55, effort: 9 }).toFile(`${base}-${full}.avif`);
    await sharp(small).avif({ quality: 55, effort: 9 }).toFile(`${base}-${half}.avif`);
    await sharp(small).webp({ quality: 80, effort: 6 }).toFile(`${base}-${half}.webp`);
    const meta = await sharp(`${base}-${full}.avif`).metadata();
    console.log(`${shot.name}: ${meta.width}x${meta.height}  (${page.url()})`);
  } finally {
    await page.close();
  }
}

const only = process.argv.slice(2);
const unknown = only.filter((name) => !SHOTS.some((shot) => shot.name === name));
if (unknown.length > 0) {
  console.error(`No capture is called ${unknown.join(', ')}. The names are: ${SHOTS.map((shot) => shot.name).join(', ')}.`);
  process.exit(1);
}
const shots = only.length > 0 ? SHOTS.filter((shot) => only.includes(shot.name)) : SHOTS;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
});
let failed = 0;
try {
  const contexts = {
    desktop: await browser.newContext(DESKTOP),
    mobile: await browser.newContext(MOBILE),
  };
  for (const shot of shots) {
    try {
      await capture(contexts[shot.kind], shot);
    } catch (error) {
      failed += 1;
      console.error(`${shot.name}: not captured. ${error instanceof Error ? error.message : error}`);
    }
  }
} finally {
  await browser.close();
}
process.exit(failed > 0 ? 1 : 0);
