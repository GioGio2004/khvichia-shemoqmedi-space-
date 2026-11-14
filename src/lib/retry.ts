import { lazy, type ComponentType } from 'react'

/**
 * Like React's lazy(), but a part that fails to load is fetched once more
 * before giving up. The 3D parts of the page are separate files; if one
 * fetch fails (a dropped connection, or a development server that has just
 * rebuilt its files), the page should not fall back to its plain version
 * for good.
 */
export function lazyWithRetry<P extends object>(load: () => Promise<{ default: ComponentType<P> }>) {
  return lazy(() =>
    load().catch(
      () =>
        new Promise<{ default: ComponentType<P> }>((resolve, reject) => {
          window.setTimeout(() => load().then(resolve, reject), 800)
        }),
    ),
  )
}
