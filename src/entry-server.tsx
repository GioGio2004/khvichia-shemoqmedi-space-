import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'

/**
 * The whole page as a piece of HTML. Used once, while building the site
 * (scripts/prerender.mjs), to write the page into index.html. It must draw
 * exactly what main.tsx draws, or the browser's take-over will not match.
 */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
