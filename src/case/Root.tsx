import { Mark } from '../components/Mark'
import { Menu } from '../components/Menu'
import { useSmoothScroll } from '../lib/scroll'
import { work } from '../content/work'
import { Case } from './Case'
import { Crumb } from './Crumb'
import { NotFound } from './NotFound'
import { pageAt } from './route'

/**
 * Everything on a page that is not the home page: the monogram and the menu
 * tab the whole site shares, the tag beside the monogram, and then the case
 * study the address names, or the "not found" page when it names none.
 */
export function Root({ path }: { path: string }) {
  // Smooth scrolling, as on the home page. Left off for people who ask for less motion.
  useSmoothScroll()
  const page = pageAt(path)

  return (
    <>
      {/* One landmark for the two things in the top left corner. Both are fixed in place, so it takes no room itself. */}
      <nav aria-label="Where you are">
        <Mark home />
        <Crumb index={page.kind === 'case' ? page.work.index : undefined} total={work.length} />
      </nav>
      <Menu home />
      {page.kind === 'case' ? <Case item={page.work} /> : <NotFound />}
    </>
  )
}
