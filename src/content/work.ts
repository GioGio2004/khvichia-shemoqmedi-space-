import { sites, type Site } from './sites'

/**
 * The four projects, in the order the gallery shows them. This is the one
 * place their story is written: the gallery takes its lines from here, and
 * each project's own page (/work/<slug>) is built from it.
 *
 *   slug            the address: /work/<slug>
 *   index           its number, 1 to 4
 *   title           the name
 *   eyebrow         three words above the name: what kind of work it is
 *   tagline         one line under the name in the gallery
 *   subtitle        one line under the name on its own page
 *   role, status    what he did, and where the project stands
 *   year            when, if the project's history says so (`null` = unknown, not shown)
 *   stack           what it is built with (only what the project's code really uses)
 *   overview, challenge, engineeringNote    the paragraphs of its page
 *   contributions   "what I built": a label, one line, and optionally the name of a picture that shows it
 *   evidence        where it stands now, and what comes next
 *   site            its address, its gallery pictures and whether it may be shown live in a frame (see sites.ts)
 *   media           the pictures of its page: `hero` and `gallery` are names from mediaList below
 *   next            the slug of the project its page leads on to
 *
 * Rules for the words (from docs/PORTFOLIO_PLAN.md, Appendix A section 5):
 * nothing is claimed that is not true today. No "first" or "leading". Kalami
 * is a pilot with 15 students; more than 100 is a target. Jury invitations
 * are not memberships. The award review of Kencho Room is pending. A value
 * nobody has confirmed is `null` and is not shown.
 */

export type Contribution = { title: string; body: string; media?: string }

export type Picture = {
  /** The file's base name in src/assets/work/<slug>/ (see src/content/media.ts). */
  name: string
  kind: 'desktop' | 'mobile'
  width: number
  height: number
  alt: string
  /** A short line under the picture. */
  caption?: string
}

export type Work = {
  slug: string
  index: number
  title: string
  eyebrow: string
  tagline: string
  subtitle: string
  role: string
  status: string
  /** What kind of project it is, for the "at a glance" strip. */
  type: string
  year: string | null
  stack: string[]
  overview: string
  challenge: string
  contributions: Contribution[]
  engineeringNote: string
  evidence: { now: string; next?: string; later?: string }
  /** The labels of its links. */
  cta: { preview: string; visit: string }
  site: Site
  media: { hero: string | null; gallery: string[] }
  pictures: Picture[]
  next: string
}

const site = (slug: string) => {
  const found = sites.find((item) => item.slug === slug)
  if (!found) throw new Error(`No site called ${slug} in sites.ts`)
  return found
}

export const work: Work[] = [
  {
    slug: 'shemoqmedi',
    index: 1,
    title: 'Shemoqmedi',
    eyebrow: 'Platform · Community · Awards',
    // The approved lines said "a home for Georgia's digital creators". The live site lists websites from everywhere
    // and calls itself "Website Awards Made in Georgia", so the lines say that. TODO(owner): confirm the wording.
    tagline: 'Website awards, made in Georgia: a stage for great websites and the people behind them.',
    subtitle: 'Recognizing great websites, and giving Georgian web design a stage beside them.',
    role: 'Founder · Product design · Full-stack engineering',
    status: 'Active development & community building',
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
    cta: { preview: 'Explore Shemoqmedi', visit: 'Visit live platform' },
    site: site('shemoqmedi'),
    media: {
      hero: 'browse',
      gallery: ['home', 'nominees', 'listing', 'scores', 'badges', 'home-mobile', 'browse-mobile'],
    },
    pictures: [
      {
        name: 'browse',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The “All websites” directory on shemoqmedi.space: filters for award and category above a grid of listed sites, each with its name, maker and stack.',
        caption: 'Directory',
      },
      {
        name: 'home',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The first screen of shemoqmedi.space: the header with search, menu and “Submit site”, and a large slide showing one of the listed websites.',
        caption: 'First screen',
      },
      {
        name: 'nominees',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The “Nominees this week” row: three nominated sites, each with a countdown to the end of live voting.',
        caption: 'Nominees this week',
      },
      {
        name: 'listing',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'A listing page on shemoqmedi.space: the name of the site set very large, a short description, tags and a “Visit live site” button.',
        caption: 'A listing',
      },
      {
        name: 'scores',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The details of a listing: category, what it was built with, who made it and when it was listed, and a score card with design, usability, creativity and content.',
        caption: 'Details and score card',
      },
      {
        name: 'badges',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The four award badges of shemoqmedi.space, each a round badge with a crow: Site of the Year, Site of the Month, Site of the Day and Honorable Mention.',
        caption: 'The four awards',
      },
      {
        name: 'home-mobile',
        kind: 'mobile',
        width: 780,
        height: 1688,
        alt: 'shemoqmedi.space on a phone: the slide of a listed site, the heading “the web’s finest websites” and a “Submit your site” button.',
        caption: 'First screen, phone',
      },
      {
        name: 'browse-mobile',
        kind: 'mobile',
        width: 780,
        height: 1688,
        alt: 'The “All websites” directory on a phone: the award filters and the listed sites one under another.',
        caption: 'Directory, phone',
      },
    ],
    next: 'kencho-room',
  },
  {
    slug: 'kencho-room',
    index: 2,
    title: 'Kencho Room',
    eyebrow: 'Creative development · Immersive web',
    tagline: 'A furniture showroom designed to be explored, not just scrolled.',
    subtitle: 'An interactive room for a custom-furniture brand.',
    role: 'Creative developer · Interactive engineering',
    // "Live" is what can be checked. TODO(owner): say "Delivered" if the client has signed it off.
    status: 'Client project · Live',
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
    cta: { preview: 'Enter the showroom', visit: 'Visit the showroom' },
    site: site('kencho-room'),
    media: {
      hero: 'room',
      gallery: ['kitchen', 'finishes', 'gallery-wall', 'drawing', 'palettes', 'room-mobile', 'kitchen-mobile'],
    },
    pictures: [
      {
        name: 'room',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The Kencho Room: a room drawn like a coloured sketch, with a kitchen, a gallery wall, a workshop door and a living area, each marked with a label that leads further in.',
        caption: 'The room',
      },
      {
        name: 'kitchen',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The kitchen seen up close: a label names the material of the wall units, and a bar along the bottom offers the finish, five viewing angles and “Build this kitchen”.',
        caption: 'The kitchen',
      },
      {
        name: 'finishes',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The kitchen in forest green with the list of finishes open beside it: sage and oak, forest green, warm white, greige and graphite, retro terracotta.',
        caption: 'Finishes',
      },
      {
        name: 'gallery-wall',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The gallery wall of the room: four framed photographs of finished kitchens.',
        caption: 'The gallery wall',
      },
      {
        name: 'drawing',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The room while it is being drawn: pale outlines of the kitchen, the door and the living area before the colour comes in.',
        caption: 'The room, being drawn',
      },
      {
        name: 'palettes',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The “Pick a palette” screen: five tall colour cards, with forest green opened wide.',
        caption: 'Palettes',
      },
      {
        name: 'room-mobile',
        kind: 'mobile',
        width: 780,
        height: 1688,
        alt: 'The Kencho Room on a phone: the kitchen fills the screen, with “Design your kitchen” and arrows to look around the room under it.',
        caption: 'The room, phone',
      },
      {
        name: 'kitchen-mobile',
        kind: 'mobile',
        width: 780,
        height: 1688,
        alt: 'The kitchen on a phone: dots mark the parts that can be tapped, with the viewing angles and the finish under the picture.',
        caption: 'The kitchen, phone',
      },
    ],
    next: 'kencho-group',
  },
  {
    slug: 'kencho-group',
    index: 3,
    title: 'Kencho Group',
    eyebrow: 'Client work · Web experience',
    tagline: 'A digital home for a custom-furniture studio.',
    subtitle: 'Giving a custom-furniture business a distinctive digital presence.',
    role: 'Full-stack / frontend implementation · End-to-end delivery',
    status: 'Client project · Delivered',
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
    cta: { preview: 'Explore Kencho Group', visit: 'Visit Kencho Group' },
    site: site('kencho-group'),
    media: {
      hero: 'home',
      gallery: ['catalogue', 'categories', 'viewer', 'process', 'contact', 'home-mobile', 'catalogue-mobile'],
    },
    pictures: [
      {
        name: 'home',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The first screen of kenchogroup.ge: “we are Kencho Group, we make custom furniture” in very large white letters on black.',
        caption: 'First screen',
      },
      {
        name: 'catalogue',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The catalogue page: the word “Catalogue” set very large, a short introduction, a “Request a project” button and the first row of photographs.',
        caption: 'Catalogue',
      },
      {
        name: 'categories',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'Four large photographs that lead into the catalogue by room: living room, wardrobe, hall and bedroom.',
        caption: 'Rooms',
      },
      {
        name: 'viewer',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'One catalogue photograph opened large, a walnut island kitchen, with its materials, lead time and delivery beside it.',
        caption: 'A catalogue entry',
      },
      {
        name: 'process',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The process section: “from idea to installation” and the steps as large cards.',
        caption: 'Process',
      },
      {
        name: 'contact',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The project request page: “Let’s create your space” beside a form for the visitor’s details and their project.',
        caption: 'Project request',
      },
      {
        name: 'home-mobile',
        kind: 'mobile',
        width: 780,
        height: 1688,
        alt: 'kenchogroup.ge on a phone: the large “we are Kencho Group” heading above the first room photograph.',
        caption: 'First screen, phone',
      },
      {
        name: 'catalogue-mobile',
        kind: 'mobile',
        width: 780,
        height: 1688,
        alt: 'The catalogue on a phone: the heading, a “Request a project” button, a filter and the photographs in two columns.',
        caption: 'Catalogue, phone',
      },
    ],
    next: 'kalami',
  },
  {
    slug: 'kalami',
    index: 4,
    title: 'Kalami',
    eyebrow: 'EdTech · Product engineering · Education',
    tagline: 'Built in the classroom. Tested by the people learning in it.',
    subtitle: 'An educational platform shaped by real classroom needs.',
    role: 'Creator · Full-stack engineer · University lecturer',
    status: 'Active university pilot',
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
    cta: { preview: 'Explore Kalami', visit: 'View the platform' },
    site: site('kalami'),
    media: {
      hero: 'home',
      gallery: ['sandbox', 'live-class', 'studio', 'levels', 'staff', 'home-mobile', 'notebook-mobile'],
    },
    pictures: [
      {
        name: 'home',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The first screen of kalami.space: the heading “Good learning starts with your own hand” beside a drawing of a pen writing on a notebook page.',
        caption: 'First screen',
      },
      {
        name: 'sandbox',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'An illustrative view of the code exercise: an HTML file in an editor, its preview beside it and checks under it.',
        caption: 'Code exercise',
      },
      {
        name: 'live-class',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'An illustrative view of a live assessment: a list of students with their progress and flags that need attention.',
        caption: 'Live assessment',
      },
      {
        name: 'studio',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The course studio on the lecturers’ page: a course laid out in weeks, with lessons, tasks, a quiz and an exam.',
        caption: 'Course studio',
      },
      {
        name: 'levels',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The three integrity levels an assessment can have: practice for homework, standard for quizzes and strict for exams.',
        caption: 'Integrity levels',
      },
      {
        name: 'staff',
        kind: 'desktop',
        width: 1440,
        height: 900,
        alt: 'The page for lecturers and universities: “The control room for honest exams” above a live monitor and a similarity report.',
        caption: 'For lecturers',
      },
      {
        name: 'home-mobile',
        kind: 'mobile',
        width: 780,
        height: 1688,
        alt: 'kalami.space on a phone: the heading “Good learning starts with your own hand” and the buttons “Open your notebook” and “For lecturers”.',
        caption: 'First screen, phone',
      },
      {
        name: 'notebook-mobile',
        kind: 'mobile',
        width: 780,
        height: 1688,
        alt: 'An illustrative view of a student’s notebook on a phone: an open quiz and two courses with their progress.',
        caption: 'Notebook, phone',
      },
    ],
    next: 'shemoqmedi',
  },
]

export const workBySlug = (slug: string) => work.find((item) => item.slug === slug)
