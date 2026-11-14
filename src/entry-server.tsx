import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'
import { Root } from './case/Root'
import { headFor, homeHead, pageAt, paths, SITE_NAME, type Head } from './case/route'
import { pictureFiles } from './content/media'
import { work } from './content/work'

/**
 * Every page of the site as a piece of HTML. Used once, while building
 * (scripts/prerender.mjs), to write each page into its own file. It must
 * draw exactly what the browser's scripts draw (main.tsx for the home page,
 * case/main.tsx for every other page), or their take-over will not match.
 */

// Every picture named in work.ts must have all its files, whether a page shows it yet or not: asking for one that is
// incomplete stops the build here, with the name of the missing file.
for (const item of work) for (const picture of item.pictures) pictureFiles(item.slug, picture)

/** The addresses to build: "/", the four case studies and "/404". */
export { paths }

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
}

export function render(path = '/'): Rendered {
  if (path === '/') {
    const html = renderToString(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    return { html, shell: 'index.html', file: 'index.html', head: null, share: { ...homeHead, siteName: SITE_NAME } }
  }

  const head = headFor(pageAt(path))
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
  }
}
