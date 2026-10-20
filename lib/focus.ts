/** Pure maths shared by the site and the admin page (safe in the browser). */

/** Every photo box on the site except the home banner is 4:3. */
export const CARD_ASPECT = 4 / 3;

/**
 * CSS object-position that puts the photo's focal point as close to the
 * centre of a box (width / height = boxAspect) as the photo's edges allow.
 * A plain "x% y%" from the hotspot would NOT centre it: object-position
 * aligns the photo's x% point with the box's x% point, so a subject at
 * 30% would sit at 30% of the box rather than in the middle.
 */
export function focusPosition(img: { width: number; height: number; focus: { x: number; y: number } }, boxAspect: number): string {
  const aspect = img.width / img.height;
  // visible = fraction of the photo's width (or height) that fits the box.
  const axis = (focus: number, visible: number) =>
    visible >= 1 ? 50 : Math.round(Math.min(1, Math.max(0, (focus - visible / 2) / (1 - visible))) * 1000) / 10;
  const x = aspect > boxAspect ? axis(img.focus.x, boxAspect / aspect) : 50;
  const y = aspect < boxAspect ? axis(img.focus.y, aspect / boxAspect) : 50;
  return `${x}% ${y}%`;
}
