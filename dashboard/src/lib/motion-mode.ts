/** True when the page should render end-states instantly: the ?static
 *  verification flag, or the user's reduced-motion preference. */
export const STATIC_MODE = new URLSearchParams(location.search).has("static");

export function prefersInstant(): boolean {
  try {
    return STATIC_MODE || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return STATIC_MODE;
  }
}
