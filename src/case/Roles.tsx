import type { CSSProperties } from 'react'
import { two } from './fit'
import type { Role } from './look'

/**
 * A small diagram of who uses a product: one box per role on a shared rail,
 * each with the role's name and what that role can do. It is drawn with
 * plain boxes and lines, not a picture, so it stays sharp and readable at
 * any size. It takes the list of roles from look.ts.
 */
export function Roles({ roles }: { roles: Role[] }) {
  return (
    <ul className="case-roles" aria-label="Roles" style={{ '--n': roles.length } as CSSProperties}>
      {roles.map((role, i) => (
        <li key={role.name} data-reveal="up" style={{ '--d': i } as CSSProperties}>
          <span className="case-role-tag">Role {two(i + 1)}</span>
          <h3>{role.name}</h3>
          <ul>
            {role.can.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
