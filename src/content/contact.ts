/**
 * The ways to reach him, shown when "Contact" is pressed in the menu, in
 * this order. `kind` picks the icon; `text` is what is shown; `href` is
 * where it leads (an address opens in a new tab, mail and phone do not).
 */
export type Way = { kind: 'email' | 'phone' | 'linkedin' | 'github' | 'shemoqmedi'; label: string; text: string; href: string }

export const contact: Way[] = [
  { kind: 'email', label: 'Email', text: 'giorgi.khvichia18@gmail.com', href: 'mailto:giorgi.khvichia18@gmail.com' },
  { kind: 'phone', label: 'Phone', text: '+995 599 25 18 40', href: 'tel:+995599251840' },
  {
    kind: 'linkedin',
    label: 'LinkedIn',
    text: 'in/giorgi-khvichia-a73755254',
    href: 'https://www.linkedin.com/in/giorgi-khvichia-a73755254/',
  },
  { kind: 'github', label: 'GitHub', text: 'GioGio2004', href: 'https://github.com/GioGio2004' },
  { kind: 'shemoqmedi', label: 'Studio', text: 'shemoqmedi.space', href: 'https://shemoqmedi.space' },
]

/**
 * The CV behind the "Download my CV" button, and its Georgian version. The
 * files are made by `npm run cv` (words in scripts/cv-content.mjs) and live
 * in public/cv/.
 */
export const cv = {
  label: 'Download my CV',
  file: '/cv/Giorgi-Khvichia-CV.pdf',
  other: { label: 'Georgian version', file: '/cv/Giorgi-Khvichia-CV-KA.pdf' },
}
