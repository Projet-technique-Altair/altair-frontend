/**
 * Smoothly scrolls the window to a given Y position.
 *
 * @param targetY Target Y position in pixels
 * @param duration Animation duration in ms (default: 1200)
 */
export function smoothScrollTo(targetY: number, duration: number = 1200) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime: number | null = null;

  function easeInOutCubic(t: number) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}
