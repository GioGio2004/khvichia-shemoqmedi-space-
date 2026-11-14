import '@fontsource-variable/inter'
import '@fontsource/anton'
import './styles.css'

import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The built site ships with the page already written into the HTML (see scripts/prerender.mjs), so the first paint
// does not wait for this script; here the script only takes that page over. While developing there is nothing in
// the HTML yet, and the page is drawn from scratch.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
