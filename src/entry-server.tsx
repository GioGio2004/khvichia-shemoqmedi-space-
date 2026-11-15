import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'
import { Root } from './case/Root'
import { headFor, homeHead, ORIGIN, pageAt, paths, SITE_NAME, type Head } from './case/route'
import { work } from './content/cases'

/**
 * Every page of the site as a piece of HTML. Used once, while building
 * (scripts/prerender.mjs), to write each page into its own file. It must
 * draw exactly what the browser's scripts draw (main.tsx for the home page,
 * case/main.tsx for every other page), or their take-over will not match.
 */

/** The addresses to build: "/", the four case studies and "/404". */
export { paths }

/**
 * One line about each case study for public/llms.txt (the page that tells AI assistants what is on this site). The
 * build writes them from work.ts and cases.ts, so that file can never say something about a project that its own page does not.
 */
export const caseLines = work.map((item) => {
  const head = headFor({ kind: 'case', work: item })
  const list = (text: string) => text.split(' · ').join(', ')
  return `- [${item.title}, case study](${head.canonical}): ${head.description} Role: ${list(item.role)}. Stage: ${list(item.status)}.`
})

export type Rendered = {
  /** The page's HTML, to go inside #root. */
  html: string
  /** Which built HTML file it is poured into: index.html for the home page, case.html for every other page. */
  shell: 'index.html' | 'case.html'
  /** Where the finished page is written, inside dist/. */
  file: string
  /** The whole head of the page. The home page has none: it keeps the head written in index.html. */
  head: Head | null
  /** What every page's head says about sharing; the home page adds only this. */
  share: { image: string; imageAlt: string; siteName: string }
  /** Structured data for search engines (a case study's CreativeWork), or null. Only fields that are known are written. */
  data: Record<string, unknown> | null
}

export function render(path = '/'): Rendered {
  if (path === '/') {
    const html = renderToString(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    return { html, shell: 'index.html', file: 'index.html', head: null, share: { ...homeHead, siteName: SITE_NAME }, data: null }
  }

  const page = pageAt(path)
  const head = headFor(page)
  const html = renderToString(
    <StrictMode>
      <Root path={path} />
    </StrictMode>,
  )
  return {
    html,
    shell: 'case.html',
    file: path === '/404' ? '404.html' : `${path.slice(1)}/index.html`,
    head,
    share: { image: head.image, imageAlt: head.imageAlt, siteName: SITE_NAME },
    data:
      page.kind === 'case'
        ? {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: page.work.title,
            headline: page.work.subtitle,
            description: page.work.tagline,
            url: head.canonical,
            image: head.image,
            ...(page.work.year ? { dateCreated: page.work.year } : {}),
            ...(page.work.stack.length ? { keywords: page.work.stack.join(', ') } : {}),
            // The project itself, live.
            sameAs: page.work.site.url,
            creator: { '@type': 'Person', name: SITE_NAME, url: `${ORIGIN}/` },
          }
        : null,
  }
}
