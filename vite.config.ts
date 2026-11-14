import { existsSync, readFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * The site has two HTML files: index.html (the home page) and case.html (the
 * four case studies at /work/<slug> and the "not found" page). There is no
 * router; every page is a real page load. The build writes one finished file
 * per address (scripts/prerender.mjs); this plugin makes the two local
 * servers answer the same addresses the same way:
 *
 *   npm run dev      any address that is not the home page and not a file
 *                    is answered with case.html, whose script draws the case
 *                    study the address names, or the "not found" page
 *   npm run preview  /work/kalami and /work/kalami/ are answered with
 *                    dist/work/kalami/index.html; an address that has no
 *                    file gets dist/404.html with status 404 (never the
 *                    home page), as it will once the site is deployed. That
 *                    holds for a missing file too (/missing.png), so a
 *                    status check in local QA can be trusted
 *
 * `appType: 'mpa'` below tells both servers that this is a site of several
 * pages: without it they answer anything they do not know with the home page.
 */

/** The path of a request as plain text, or null when it is not written properly (a broken % code). */
function pathOf(url: string) {
  try {
    return decodeURIComponent(url.split(/[?#]/)[0])
  } catch {
    return null
  }
}

function pages(): Plugin {
  return {
    name: 'pages',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        // A broken address is drawn as the "not found" page like any other unknown one.
        const path = pathOf(req.url ?? '/') ?? '/not-found'
        const internal = /^\/(@|src\/|node_modules\/|__)/.test(path)
        const wantsPage = req.headers.accept?.includes('text/html') ?? false
        if (path !== '/' && !internal && !extname(path) && wantsPage) req.url = '/case.html'
        next()
      })
    },
    configurePreviewServer(server) {
      const dist = resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use((req, res, next) => {
        const query = (req.url ?? '').split('?')[1] ?? ''
        const path = pathOf(req.url ?? '/')?.replace(/\/+$/, '')
        if (path === '') return next()
        if (path !== undefined && !path.includes('..')) {
          // A file that is there (a script, a picture, the CV) is served as it is.
          if (extname(path) && existsSync(join(dist, path))) return next()
          for (const file of extname(path) ? [] : [`${path}/index.html`, `${path}.html`]) {
            if (!existsSync(join(dist, file))) continue
            req.url = query ? `${file}?${query}` : file
            return next()
          }
        }
        const missing = join(dist, '404.html')
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(existsSync(missing) ? readFileSync(missing) : 'Not found')
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), pages()],
  appType: 'mpa',
  server: { port: 5173, strictPort: true },
  build: {
    target: 'es2022',
    // Source maps go out with the site: the code is public anyway, and they let browser tools show readable errors.
    sourcemap: true,
    // three.js alone is ~600 kB raw; the 3D chunk is lazy-loaded, so the warning is noise.
    chunkSizeWarningLimit: 900,
    // Two pages, two scripts: the case studies never load the home page's code, and what both use is shared.
    rollupOptions: { input: { index: 'index.html', case: 'case.html' } },
  },
})
