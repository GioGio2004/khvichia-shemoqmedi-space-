/**
 * How the footer spends its scrolling, measured in screen heights. The photos
 * of the side scroll have already lined up by the time it reaches the top
 * (they do that while the footer is coming up). Then: a short SETTLE on the
 * row, the CUT where each photo is trimmed to its letter, a PAUSE on the
 * word, the FLOOD where the stage turns orange and the word grows to fill
 * the screen, the INK where the letters fill with black, and a HOLD.
 */
export const SETTLE = 0.35
export const CUT = 0.9
export const PAUSE = 0.4
export const FLOOD = 1
export const INK = 1
export const HOLD = 0.8

export const scrollLength = SETTLE + CUT + PAUSE + FLOOD + INK + HOLD
