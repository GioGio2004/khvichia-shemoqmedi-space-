import { useOnDark } from '../lib/useOnDark'

/**
 * The GK monogram in the top left corner. On the home page it leads back to the top; on any other page (`home` set)
 * it leads to the home page. It turns light over dark sections like the menu tab.
 */
export function Mark({ home = false }: { home?: boolean }) {
  const onDark = useOnDark(32)
  return (
    <a
      className="mark"
      href={home ? '/' : '#top'}
      data-tone={onDark ? 'light' : 'dark'}
      aria-label={home ? 'GK: Giorgi Khvichia, to the home page' : 'GK: Giorgi Khvichia, back to the top'}
    >
      GK
    </a>
  )
}
