/**
 * The menu has two full-screen sheets, About and Contact. Anything on the
 * page can ask for one (the footer's Contact button, a case-study page):
 * it calls openSheet, and the menu, which listens for the event, opens.
 */
export type Sheet = 'about' | 'contact'

export const SHEET_EVENT = 'gk:sheet'

export function openSheet(sheet: Sheet) {
  window.dispatchEvent(new CustomEvent<Sheet>(SHEET_EVENT, { detail: sheet }))
}
