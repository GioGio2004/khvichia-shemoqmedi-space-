/**
 * What he builds with, in three groups. Each group is one card of the stack
 * section, and the cards come in the site's three colours in this order:
 * orange, charcoal, white.
 *
 *   title   the card's name, shown on its strip
 *   blurb   one line shown at the foot of the card until a name is pointed at
 *   tools   the names, in order. `usedIn` lists the projects (slugs in
 *           work.ts) whose code really uses it; while a name is pointed at,
 *           the foot of the card names them ("GLSL · Kencho Room"). `note`
 *           is the line shown instead for a tool none of the four use.
 *
 * TODO(owner) D9: trim each list to tools used in at least one case study?
 * Today that would remove Figma and Blender. Nothing has been removed.
 * TODO(owner) D10: add SQL / SQL Server / C# to Engine? Not added.
 *
 * The notes are drafts written from the projects themselves; correct anything
 * that is off.
 */
export type Tool = { name: string; note: string; usedIn: string[] }
export type Group = { tone: 'accent' | 'ink' | 'paper'; title: string; blurb: string; tools: Tool[] }

export const stack: Group[] = [
  {
    tone: 'accent',
    title: 'Interface',
    blurb: 'Where motion, clarity, and performance meet.',
    tools: [
      { name: 'Next.js', note: 'Shemoqmedi, Kencho Group and Kalami run on it.', usedIn: ['shemoqmedi', 'kencho-group', 'kalami'] },
      { name: 'React', note: 'Every interface, from admin dashboards to this page.', usedIn: ['shemoqmedi', 'kencho-room', 'kencho-group', 'kalami'] },
      { name: 'Tailwind CSS', note: 'Design systems that stay small and consistent.', usedIn: ['shemoqmedi', 'kencho-group', 'kalami'] },
      { name: 'GSAP', note: 'Timelines and scroll-driven motion.', usedIn: ['shemoqmedi', 'kencho-room', 'kencho-group', 'kalami'] },
      { name: 'Lenis', note: 'Smooth scrolling. This page uses it.', usedIn: ['kencho-room', 'kencho-group'] },
      { name: 'Three.js', note: '3D in the browser, with shaders written by hand.', usedIn: ['kencho-room'] },
      { name: 'React Three Fiber', note: 'The curved gallery and the letters further down.', usedIn: ['kencho-room'] },
      { name: 'Vite', note: 'What this site is built with.', usedIn: ['kencho-room'] },
      { name: 'Vercel', note: 'Where the sites go live.', usedIn: ['shemoqmedi', 'kencho-room', 'kencho-group', 'kalami'] },
    ],
  },
  {
    tone: 'ink',
    title: 'Engine',
    blurb: 'The systems behind the experience.',
    tools: [
      { name: 'Convex', note: 'Real-time database and server functions behind every platform.', usedIn: ['shemoqmedi', 'kencho-group', 'kalami'] },
      { name: 'ImageKit', note: 'Screenshots stored once, served as WebP at any size.', usedIn: ['shemoqmedi', 'kencho-group', 'kalami'] },
      { name: 'Cloudflare', note: 'R2 for video, and web analytics.', usedIn: ['shemoqmedi'] },
      { name: 'TypeScript', note: 'The default for everything that ships.', usedIn: ['shemoqmedi', 'kencho-room', 'kencho-group', 'kalami'] },
      { name: 'JavaScript', note: 'Where it started, and still under all of it.', usedIn: ['shemoqmedi', 'kencho-room', 'kencho-group', 'kalami'] },
      { name: 'Python', note: 'Asset pipelines and automation.', usedIn: ['shemoqmedi'] },
      { name: 'GLSL', note: 'Shaders: the bent panels and photo-filled letters here.', usedIn: ['kencho-room'] },
      { name: 'Node.js', note: 'Scripts, APIs and build tooling.', usedIn: ['shemoqmedi', 'kencho-room', 'kencho-group', 'kalami'] },
      { name: 'Playwright', note: 'Checks every page in a real browser before it ships.', usedIn: ['kencho-group'] },
    ],
  },
  {
    tone: 'paper',
    title: 'Around it',
    blurb: 'The tools that connect the product to real life.',
    tools: [
      { name: 'Clerk', note: 'Sign-in, organisations and roles.', usedIn: ['shemoqmedi', 'kencho-group', 'kalami'] },
      { name: 'Resend', note: 'Email: jury invitations and award notices.', usedIn: ['shemoqmedi', 'kencho-group', 'kalami'] },
      { name: 'PWA', note: 'Studio installs like an app and works from the home screen.', usedIn: ['shemoqmedi', 'kalami'] },
      { name: 'Web Push', note: 'Notifications to the phone when a post is waiting.', usedIn: ['shemoqmedi', 'kalami'] },
      { name: 'MCP', note: 'Servers that let an AI assistant work inside the products.', usedIn: ['shemoqmedi', 'kalami'] },
      { name: 'Figma', note: 'Where layouts start before they become code.', usedIn: [] },
      { name: 'Blender', note: 'Models and scenes for the web.', usedIn: [] },
      { name: 'Git', note: 'Every change, on GitHub.', usedIn: ['shemoqmedi', 'kencho-room', 'kencho-group', 'kalami'] },
    ],
  },
]
