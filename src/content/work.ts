import { sites, type Site } from './sites'

/**
 * The four projects, in the order the gallery shows them: the short facts
 * the home page needs for its gallery cards. Each project's long story (the
 * paragraphs, the pictures, the stack) is in cases.ts, which builds the case
 * studies from these cards and adds the rest by slug. The two files never
 * write the same fact twice, and the home page loads only this one, so its
 * script does not carry four case studies' worth of text.
 *
 *   slug            the address: /work/<slug>
 *   index           its number, 1 to 4
 *   title           the name
 *   eyebrow         three words above the name: what kind of work it is
 *   tagline         one line under the name in the gallery
 *   role, status    what he did, and where the project stands
 *   cta             the labels of its links
 *   site            its address, its gallery pictures and whether it may be shown live in a frame (see sites.ts)
 *
 * Rules for the words (from docs/PORTFOLIO_PLAN.md, Appendix A section 5):
 * nothing is claimed that is not true today. No "first" or "leading". A
 * value nobody has confirmed is `null` and is not shown. The same rules hold
 * in cases.ts.
 */

export type WorkCard = {
  slug: string
  index: number
  title: string
  eyebrow: string
  tagline: string
  role: string
  status: string
  /** The labels of its links. */
  cta: { preview: string; visit: string }
  site: Site
}

const site = (slug: string) => {
  const found = sites.find((item) => item.slug === slug)
  if (!found) throw new Error(`No site called ${slug} in sites.ts`)
  return found
}

export const work: WorkCard[] = [
  {
    slug: 'shemoqmedi',
    index: 1,
    title: 'Shemoqmedi',
    eyebrow: 'Platform · Community · Awards',
    // The approved lines said "a home for Georgia's digital creators". The live site lists websites from everywhere
    // and calls itself "Website Awards Made in Georgia", so the lines say that. TODO(owner): confirm the wording.
    tagline: 'Website awards, made in Georgia: a stage for great websites and the people behind them.',
    role: 'Founder · Product design · Full-stack engineering',
    status: 'Active development & community building',
    cta: { preview: 'Explore Shemoqmedi', visit: 'Visit live platform' },
    site: site('shemoqmedi'),
  },
  {
    slug: 'kencho-room',
    index: 2,
    title: 'Kencho Room',
    eyebrow: 'Creative development · Immersive web',
    tagline: 'A furniture showroom designed to be explored, not just scrolled.',
    role: 'Creative developer · Interactive engineering',
    // "Live" is what can be checked. TODO(owner): say "Delivered" if the client has signed it off.
    status: 'Client project · Live',
    cta: { preview: 'Enter the showroom', visit: 'Visit the showroom' },
    site: site('kencho-room'),
  },
  {
    slug: 'kencho-group',
    index: 3,
    title: 'Kencho Group',
    eyebrow: 'Client work · Web experience',
    tagline: 'A digital home for a custom-furniture studio.',
    role: 'Full-stack / frontend implementation · End-to-end delivery',
    status: 'Client project · Delivered',
    cta: { preview: 'Explore Kencho Group', visit: 'Visit Kencho Group' },
    site: site('kencho-group'),
  },
  {
    slug: 'kalami',
    index: 4,
    title: 'Kalami',
    eyebrow: 'EdTech · Product engineering · Education',
    tagline: 'Built in the classroom. Tested by the people learning in it.',
    role: 'Creator · Full-stack engineer · University lecturer',
    status: 'Active university pilot',
    cta: { preview: 'Explore Kalami', visit: 'View the platform' },
    site: site('kalami'),
  },
]
