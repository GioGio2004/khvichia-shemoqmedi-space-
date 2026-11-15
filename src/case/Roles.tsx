import type { CSSProperties } from 'react'
import type { Contribution } from '../content/cases'
import { two } from './fit'

/**
 * A diagram of who uses a product. The roles hang from one line that runs
 * down the left side: the first role starts on it, and each next role
 * branches off it one step further in, with an orange square where it
 * starts. So the roles read as levels of one system and not as separate
 * boxes. It is drawn with plain lines, not a picture, so it stays sharp at
 * any size. The names and the words are the contributions in cases.ts that
 * look.ts names as roles.
 */
export function Roles({ roles }: { roles: Contribution[] }) {
  return (
    <ol className="case-roles" aria-label="Roles">
      {roles.map((role, i) => (
        <li key={role.title} data-reveal="up" style={{ '--d': i, '--step': i } as CSSProperties}>
          {i > 0 ? <i className="case-role-branch" aria-hidden /> : null}
          <div className="case-role">
            <span className="case-role-tag">Role {two(i + 1)}</span>
            <h3>{role.title}</h3>
            <p>{role.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
