import { useOnDark } from '../lib/useOnDark'
import { two } from './fit'

/**
 * The small tag beside the monogram on a case study: which project of how
 * many this is, and the way back to all of them. It is a solid tag, like the
 * monogram, so it reads over anything that scrolls under it, and it turns
 * light over the dark parts of the page the same way. The "not found" page
 * has no number, only the way back.
 */
export function Crumb({ index, total }: { index?: number; total: number }) {
  const onDark = useOnDark(32)
  return (
    <nav className="case-crumb" aria-label="Where you are" data-tone={onDark ? 'light' : 'dark'}>
      {index ? (
        <span className="case-crumb-index">
          <span>Work / </span>
          {`${two(index)} of ${two(total)}`}
        </span>
      ) : null}
      <a href="/#work">All work</a>
    </nav>
  )
}
