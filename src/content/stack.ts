/**
 * What he builds with, in three groups. Each group is one card of the stack
 * section, and the cards come in the site's three colours in this order:
 * orange, charcoal, white.
 *
 *   title   the card's name, shown on its strip
 *   blurb   one line shown at the foot of the card until a name is pointed at
 *   tools   the names, in order; `note` is what shows at the foot of the card
 *           while that name is pointed at: what it was used for
 *
 * The notes are drafts written from the projects themselves; correct anything
 * that is off.
 */
export type Tool = { name: string; note: string }
export type Group = { tone: 'accent' | 'ink' | 'paper'; title: string; blurb: string; tools: Tool[] }

export const stack: Group[] = [
  {
    tone: 'accent',
    title: 'Interface',
    blurb: 'What you see and touch.',
    tools: [
      { name: 'Next.js', note: 'shemoqmedi, Kalami and Voloostore run on it.' },
      { name: 'React', note: 'Every interface, from admin dashboards to this page.' },
      { name: 'Tailwind CSS', note: 'Design systems that stay small and consistent.' },
      { name: 'GSAP', note: 'Timelines and scroll-driven motion.' },
      { name: 'Lenis', note: 'Smooth scrolling. This page uses it.' },
      { name: 'Three.js', note: '3D in the browser, with shaders written by hand.' },
      { name: 'React Three Fiber', note: 'The curved gallery and the letters further down.' },
      { name: 'Vite', note: 'What this site is built with.' },
      { name: 'Vercel', note: 'Where the sites go live.' },
    ],
  },
  {
    tone: 'ink',
    title: 'Engine',
    blurb: 'What runs underneath.',
    tools: [
      { name: 'Convex', note: 'Real-time database and server functions behind every platform.' },
      { name: 'ImageKit', note: 'Screenshots stored once, served as WebP at any size.' },
      { name: 'Cloudflare', note: 'R2 for video, and web analytics.' },
      { name: 'TypeScript', note: 'The default for everything that ships.' },
      { name: 'JavaScript', note: 'Where it started, and still under all of it.' },
      { name: 'Python', note: 'Asset pipelines and automation.' },
      { name: 'GLSL', note: 'Shaders: the bent panels and photo-filled letters here.' },
      { name: 'Node.js', note: 'Scripts, APIs and build tooling.' },
      { name: 'Playwright', note: 'Checks every page in a real browser before it ships.' },
    ],
  },
  {
    tone: 'paper',
    title: 'Around it',
    blurb: 'Everything around the code.',
    tools: [
      { name: 'Clerk', note: 'Sign-in, organisations and roles.' },
      { name: 'Resend', note: 'Email: jury invitations and award notices.' },
      { name: 'PWA', note: 'Studio installs like an app and works from the home screen.' },
      { name: 'Web Push', note: 'Notifications to the phone when a post is waiting.' },
      { name: 'MCP', note: 'Servers that let an AI assistant work inside the products.' },
      { name: 'Figma', note: 'Where layouts start before they become code.' },
      { name: 'Blender', note: 'Models and scenes for the web.' },
      { name: 'Git', note: 'Every change, on GitHub.' },
    ],
  },
]
