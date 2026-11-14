/**
 * Roughly how wide a line of the large title type is, in ems, so the
 * stylesheet can pick the largest size at which a project's name still fits
 * the page on one line. The numbers are the widths of Inter's letters at
 * weight 600, rounded up a little, less the tight letter-spacing the titles
 * are set with. It errs on the wide side: a name may come out a touch
 * smaller than it could be, never wider than the page.
 */
const TRACKING = 0.055

function letter(char: string) {
  if (char === ' ') return 0.27
  if ('.,:;!|'.includes(char)) return 0.3
  if ('ilj'.includes(char)) return 0.28
  if ('frt'.includes(char)) return 0.4
  if ('mw'.includes(char)) return 0.9
  if ('MW'.includes(char)) return 0.94
  if ('I'.includes(char)) return 0.3
  if (char >= 'A' && char <= 'Z') return 0.74
  return 0.62
}

/** The width of `text` in ems. */
export function ems(text: string) {
  return [...text].reduce((sum, char) => sum + letter(char) - TRACKING, 0)
}

/** The width of the longest word of `text` in ems (for narrow screens, where the title may break between words). */
export function widestWord(text: string) {
  return Math.max(...text.split(' ').map(ems))
}

export const two = (n: number) => String(n).padStart(2, '0')

/** The first sentence of a paragraph, and the rest of it (empty when there is only one sentence). */
export function firstSentence(text: string): [string, string] {
  const match = /^(.+?[.!?])\s+(\S.*)$/s.exec(text)
  return match ? [match[1], match[2]] : [text, '']
}
