/** Height of the bar that sits on top of an opened panel, in pixels. */
export const BAR = 44

/**
 * Where an opened panel's window is, in pixels inside the work section
 * (which is as large as the screen): under the menu and the bar, almost as
 * wide as the screen but never more than about twice as wide as it is tall.
 * The gallery flattens the panel onto exactly this rectangle, and the page
 * lays the live site over it, so both must use this one function.
 */
export function openWindow(width: number, height: number) {
  const narrow = width < 760
  const top = (narrow ? 60 : 72) + 8 + BAR
  const bottom = narrow ? 16 : 26
  const side = narrow ? 12 : Math.max(24, width * 0.03)
  const h = Math.max(height - top - bottom, 200)
  const w = Math.min(width - side * 2, h * 1.9)
  return { left: (width - w) / 2, top, width: w, height: h }
}
