import { profile } from './profile'

/** The words on the opening screen. */
export const hero = {
  name: 'Giorgi Khvichia',
  /** The small block above the name: a status line, and where he is. */
  status: profile.availability,
  /** Under it, what he is, in three parts. */
  descriptor: profile.descriptor,
  place: '41.7151° N, 44.8271° E // TBS',
  /**
   * The charcoal strip along the bottom: what he makes. Four entries fill it. An entry with `href` is a link to the
   * case study that shows it best; one without is plain text.
   * TODO(owner) D1: keep "Hardware" or change it to "Learning systems"? Until that is decided it has no link.
   */
  fields: [
    { label: 'Web platforms', href: '/work/shemoqmedi' },
    { label: '3D experiences', href: '/work/kencho-room' },
    { label: 'AI tools', href: '/work/kalami' },
    { label: 'Hardware' },
  ] as { label: string; href?: string }[],
}
