import { hero } from '../content/hero'
import { profile } from '../content/profile'
import { work, workBySlug, type Work } from '../content/work'

/**
 * Which page an address shows, and what goes in that page's <head>. The
 * server (entry-server.tsx, while building) and the browser (main.tsx) both
 * ask here, so they always agree.
 */

/** The site's real address: canonical links and share pictures must be written in full. */
export const ORIGIN = 'https://khvichia.shemoqmedi.space'

export type Page = { kind: 'case'; work: Work } | { kind: 'missing' }

/** The case study at /work/<slug> (with or without a slash at the end), or the "not found" page for anything else. */
export function pageAt(pathname: string): Page {
  const match = /^\/work\/([^/]+)\/?$/.exec(pathname)
  const found = match ? workBySlug(decoded(match[1])) : undefined
  return found ? { kind: 'case', work: found } : { kind: 'missing' }
}

/** A piece of an address as plain text. One that is not written properly (a broken % code) names nothing. */
function decoded(part: string) {
  try {
    return decodeURIComponent(part)
  } catch {
    return ''
  }
}

/** Every address the site has, for the build: the home page, the four case studies and the "not found" page. */
export const paths = ['/', ...work.map((item) => `/work/${item.slug}`), '/404']

export type Head = {
  title: string
  description: string
  /** The page's one true address. The "not found" page has none. */
  canonical: string | null
  /** The picture shown when the page is shared: 1200 x 630, made by `npm run og`. */
  image: string
  /** One line that says what that picture shows. */
  imageAlt: string
  /** What kind of thing the page is, for sharing. */
  type: 'website' | 'article'
  /** False keeps the page out of search results. */
  index: boolean
}

export const SITE_NAME = hero.name

/** The share picture the home page adds to the head it already has in index.html. */
export const homeHead = { image: `${ORIGIN}/og/home.png`, imageAlt: `${hero.name}. ${profile.descriptor.join(', ')}.` }

export function headFor(page: Page): Head {
  if (page.kind === 'missing') {
    return {
      title: `Page not found | ${hero.name}`,
      description: 'This address does not lead anywhere on this site.',
      canonical: null,
      image: homeHead.image,
      imageAlt: homeHead.imageAlt,
      type: 'website',
      index: false,
    }
  }
  const item = page.work
  return {
    title: `${item.title}, case study | ${hero.name}`,
    description: `${item.tagline} ${item.subtitle}`,
    canonical: `${ORIGIN}/work/${item.slug}`,
    image: `${ORIGIN}/og/${item.slug}.png`,
    imageAlt: `${item.title}. ${item.eyebrow}. A case study by ${hero.name}.`,
    type: 'article',
    index: true,
  }
}
