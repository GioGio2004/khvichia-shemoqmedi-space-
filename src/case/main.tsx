import '@fontsource-variable/inter'
import '../styles.css'
import './view-transition.css'
import './case.css'

import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Root } from './Root'
import { headFor, pageAt } from './route'

/**
 * The script of every page that is not the home page (case.html): the four
 * case studies and the "not found" page. Which one it draws is read from the
 * address. It shares the monogram, the menu and the base styles with the
 * home page and loads none of the home page's own code (no 3D).
 */
const root = document.getElementById('root')!
const path = window.location.pathname
const app = (
  <StrictMode>
    <Root path={path} />
  </StrictMode>
)

// The built pages already hold their content and their own title (see scripts/prerender.mjs); the script only takes
// them over. While developing the page is empty, so it is drawn from scratch and the title is set here.
if (root.hasChildNodes()) hydrateRoot(root, app)
else {
  document.title = headFor(pageAt(path)).title
  createRoot(root).render(app)
}
