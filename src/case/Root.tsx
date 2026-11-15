import { Mark } from '../components/Mark'
import { Menu } from '../components/Menu'
import { useSmoothScroll } from '../lib/scroll'
import { Case } from './Case'
import { NotFound } from './NotFound'
import { pageAt } from './route'

/**
 * Everything on a page that is not the home page: the monogram and the menu
 * tab the whole site shares, and then the case study the address names, or
 * the "not found" page when it names none.
 */
export function Root({ path }: { path: string }) {
  // Smooth scrolling, as on the home page. Left off for people who ask for less motion.
  useSmoothScroll()
  const page = pageAt(path)

  return (
    <>
      {/* The monogram leads home; it is fixed in place, so its landmark takes no room. */}
      <nav aria-label="Home">
        <Mark home />
      </nav>
      <Menu home />
      {page.kind === 'case' ? <Case item={page.work} /> : <NotFound />}
    </>
  )
}
