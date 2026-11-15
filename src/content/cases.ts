import { work as cards, type WorkCard } from './work'

/**
 * The long story of each of the four projects: everything its own page
 * (/work/<slug>) says beyond the gallery card. The card itself (its name,
 * eyebrow, tagline, role, status, links and site) is in work.ts and is not
 * written again here: `work` below is each card with its story added, in
 * the gallery's order. Only the case pages and the build (src/case/*,
 * src/entry-server.tsx, scripts/og.mjs) read this file; the home page reads
 * work.ts alone, so its script stays light.
 *
 *   subtitle        one line under the name on its own page
 *   type            what kind of project it is, for the "at a glance" strip
 *   year            when, if the project's history says so (`null` = unknown, not shown)
 *   stack           what it is built with (only what the project's code really uses)
 *   overview, challenge, engineeringNote    the paragraphs of its page
 *   contributions   "what I built": a label and one line
 *   evidence        where it stands now, and what comes next
 *   next            the slug of the project its page leads on to
 *
 * Rules for the words (from docs/PORTFOLIO_PLAN.md, Appendix A section 5):
 * nothing is claimed that is not true today. No "first" or "leading". Kalami
 * is a pilot with 15 students; more than 100 is a target. Jury invitations
 * are not memberships. The award review of Kencho Room is pending. A value
 * nobody has confirmed is `null` and is not shown.
 */

export type Contribution = { title: string; body: string }

/** What a case study says beyond its gallery card. */
export type Story = {
  subtitle: string
  /** What kind of project it is, for the "at a glance" strip. */
  type: string
  year: string | null
  stack: string[]
  overview: string
  challenge: string
  contributions: Contribution[]
  engineeringNote: string
  evidence: { now: string; next?: string; later?: string }
  next: string
}

/** A whole project: its gallery card (work.ts) and its story (below). */
export type Work = WorkCard & Story

const stories: Record<string, Story> = {
  'shemoqmedi': {
    subtitle: 'Recognizing great websites, and giving Georgian web design a stage beside them.',
    type: 'Platform',
    // From the project's own git history.
    year: '2026',
    stack: ['Next.js', 'React', 'TypeScript', 'Convex', 'Clerk', 'Tailwind CSS', 'ImageKit', 'Cloudflare R2', 'Resend', 'MCP', 'GSAP', 'Vercel'],
    overview:
      'Shemoqmedi is an independent website-awards platform I’m building in Georgia. It lists websites from everywhere and gives Georgian web design a stage next to the best international work, so the people who make them can earn meaningful recognition. I conceived the product, designed the experience, and engineered the application from the ground up, with support from my brother. The public platform brings together website discovery, creator profiles, and a developing awards community. Alongside it, I’ve built internal tools that help us operate and grow the platform without turning every content task into manual work.',
    challenge:
      'A credible creative community needs more than a gallery. It needs an experience people want to browse, a clear way for creators to participate, and judging processes that can earn trust. The challenge is to build the product and the community at the same time.',
    contributions: [
      { title: 'Discovery & showcases', body: 'Browsing experiences, categories, and featured websites.' },
      { title: 'Creator participation', body: 'Visible project submission and creator-facing surfaces.' },
      { title: 'Awards foundation', body: 'Jury invitations, four-pillar scoring, and the award workflow and interface for a jury-driven community.' },
      {
        title: 'Internal production studio',
        body: 'MCP-connected, AI-assisted content and media workflows used to run the platform. Internal, not a public feature.',
      },
      { title: 'Full-stack implementation', body: 'Frontend, backend integrations, data and user-facing flows.' },
    ],
    engineeringNote:
      'I treated Shemoqmedi as both a public-facing creative experience and an operational product. The interface needs to feel distinctive, while the underlying workflows need to support submissions, content, people, and future growth.',
    evidence: {
      // TODO(owner) D7: how many jury members are confirmed and how many invited; may any be named?
      now: 'The platform is live and in active development, and the community and jury are being assembled. One jury member has already joined; additional professionals have been approached.',
      // The scoring standards are already published on the site, so they are not listed as future work.
      next: 'Build sustained submissions and judging activity, keep the published scoring standards honest as volume grows, and grow participation.',
    },
    next: 'kencho-room',
  },
  'kencho-room': {
    subtitle: 'An interactive room for a custom-furniture brand.',
    type: 'Client work',
    // From the project's own git history.
    year: '2026',
    stack: ['React', 'TypeScript', 'Vite', 'Three.js', 'React Three Fiber', 'GLSL', 'GSAP', 'Lenis', 'Vercel'],
    overview:
      'Kencho Room is an immersive digital showroom created for Kencho Group, a custom-furniture business. Under a short scrolled introduction sits an interactive room that invites visitors to explore the brand spatially: a kitchen whose finishes and camera angles can be changed, a gallery wall of real projects, and doors that lead on to the studio. I developed the experience from scratch, bringing together art direction, motion, interactive presentation, and the underlying frontend implementation.',
    challenge:
      'Furniture is physical, tactile, and spatial. The challenge was to translate that feeling into a browser experience while keeping the interface usable and performant.',
    contributions: [
      { title: 'Spatial presentation', body: 'An immersive environment and exploratory navigation.' },
      { title: 'Motion & interaction', body: 'Transitions and visual treatments supporting the showroom’s atmosphere.' },
      { title: 'Brand expression', body: 'Digital art direction that connects to Kencho’s furniture identity.' },
      { title: 'On phones', body: 'The visitor stands inside the room and swipes between four stops, with the controls on a sheet along the bottom.' },
    ],
    engineeringNote:
      'The project demanded a careful balance between visual ambition and practical browser performance. I wanted the interface to feel unusual without making it difficult to use.',
    evidence: {
      // TODO(owner) D6: which award, and its current status. Until then no award is named and nothing is implied.
      // The submission is the owner's statement; nothing in the project's code or on the live site shows it.
      now: 'Live on the client’s domain. The project has been submitted for design-award review; any decision is pending.',
    },
    next: 'kencho-group',
  },
  'kencho-group': {
    subtitle: 'Giving a custom-furniture business a distinctive digital presence.',
    type: 'Client work',
    // From the project's own git history.
    year: '2026',
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'next-intl', 'Convex', 'GSAP', 'Lenis', 'ImageKit', 'Vercel'],
    overview:
      'Alongside the interactive Kencho Room, I built Kencho Group’s main website from the ground up. Where the showroom focuses on an exploratory brand experience, the main website gives the business a clear public presence and a place to present its identity and work. I handled the implementation end to end, aiming for a visual language that felt appropriate for a contemporary custom-furniture company.',
    challenge:
      'The website needed to communicate the brand clearly while complementing, rather than duplicating, the more experimental showroom experience.',
    contributions: [
      { title: 'Main brand experience', body: 'Visual structure, page layouts, and identity expression.' },
      { title: 'Project presentation', body: 'A filterable photo catalogue in four categories with a full-screen viewer, plus About, process, materials and pricing pages.' },
      { title: 'Responsive frontend', body: 'A one-column home and a two-column catalogue on phones, with a header that tucks away on scroll.' },
      { title: 'Full implementation', body: 'A production site in Georgian, Russian and English, with a project-request form that takes files, an AI project assistant, and a private inbox for requests.' },
    ],
    engineeringNote:
      'The interesting part of this engagement was creating two related experiences with different jobs: one for clarity and business presence, and one for immersion and exploration.',
    evidence: {
      now: 'Live client website in Georgian, Russian and English. It is one half of a two-part engagement: the brand site here, and the Kencho Room showroom beside it.',
    },
    next: 'kalami',
  },
  'kalami': {
    subtitle: 'An educational platform shaped by real classroom needs.',
    type: 'Product',
    // From the project's own git history.
    year: '2026',
    stack: ['Next.js', 'React', 'TypeScript', 'Convex', 'Clerk', 'Tailwind CSS', 'CodeMirror', 'MCP', 'Resend', 'Web Push', 'ImageKit'],
    overview:
      'Kalami is a learning platform I created while teaching web development fundamentals at university. It gives lecturers and students a shared environment for learning materials, assessments, interactive lessons, and hands-on coding. I designed and built the application from scratch, including role-based areas for students, lecturers, and administrators, MCP-connected tools for AI-assisted workflows, and a built-in HTML/CSS editor. The aim is not simply to digitize a classroom, but to make everyday teaching and learning easier to manage.',
    challenge:
      'Teaching web development involves explaining concepts, sharing content, managing assessments, and helping students practice in code. I wanted these activities to live in one connected environment rather than be scattered across unrelated tools.',
    contributions: [
      // The code ships a read-only connector for a student's own assistant, but the live site says "No AI for
      // students", so nothing about AI is promised here. TODO(owner): decide which of the two is right.
      { title: 'Students', body: 'Lessons, learning materials and assessments in one place.' },
      { title: 'Lecturers', body: 'Workflows for course materials, exams, assessments, and shareable visual presentations.' },
      { title: 'Administration', body: 'Distinct lecturer and super-admin roles with corresponding access.' },
      { title: 'Hands-on coding', body: 'An integrated HTML/CSS editor for classroom exercises.' },
      { title: 'Honest assessments', body: 'Blocked pasting, a different task variant for each student, and three levels of strictness to choose from.' },
      { title: 'AI connectors', body: 'MCP tools that let a lecturer’s own AI assistant prepare drafts of course material inside Kalami.' },
      { title: 'Communication', body: 'PWA support, web push notifications, and automated email flows.' },
    ],
    engineeringNote:
      'Kalami combines an interface for everyday classroom use with role-based product architecture, content workflows, and AI integrations. A key requirement was letting students work in an embedded coding environment while the lecturer follows each student’s progress live.',
    evidence: {
      now: 'Active early pilot. A first classroom exercise involved 15 students working at the same time, and the system performed well during that test.',
      next: 'Next semester target: expand to three additional lecturers and a total student base exceeding 100, subject to rollout plans and institutional agreement.',
      later: 'Longer-term ambition: faculty adoption, then wider university deployment and potential commercialization.',
    },
    next: 'shemoqmedi',
  },
}

// Every card has a story and every story a card, so a project cannot be half written.
for (const slug of Object.keys(stories)) {
  if (!cards.some((card) => card.slug === slug)) throw new Error(`cases.ts has a story for "${slug}", which is not a project in work.ts.`)
}

export const work: Work[] = cards.map((card) => {
  const story = stories[card.slug]
  if (!story) throw new Error(`cases.ts has no story for "${card.slug}" (a project in work.ts).`)
  return { ...card, ...story }
})

export const workBySlug = (slug: string) => work.find((item) => item.slug === slug)
