/**
 * Fetches, a little after the page has opened, what nobody needs in the first
 * seconds: the outline font (only drawn when a skill name is pointed at or the
 * contact sheet is open). Fetching it at load would put it in the way of
 * what the opening screen needs; fetching it now means it is ready long
 * before anyone reaches it.
 */
export function fetchLater() {
  const go = () => {
    const quiet = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 200))
    window.setTimeout(
      () =>
        quiet(() => {
          void document.fonts.load('600 1em "GK Outline"')
        }),
      2500,
    )
  }
  if (document.readyState === 'complete') go()
  else window.addEventListener('load', go, { once: true })
}
