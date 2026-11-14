import { useOnDark } from '../lib/useOnDark'

/** The GK monogram in the top left corner. It leads back to the top, and turns light over dark sections like the menu tab. */
export function Mark() {
  const onDark = useOnDark(32)
  return (
    <a className="mark" href="#top" data-tone={onDark ? 'light' : 'dark'} aria-label="Giorgi Khvichia, back to the top">
      GK
    </a>
  )
}
