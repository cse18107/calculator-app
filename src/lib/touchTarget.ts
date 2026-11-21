/**
 * Hit slop that lets a visually small control reach the minimum touch target
 * without changing its drawn size. Pure utility: no React imports.
 */
export function touchSlop(contentHeight: number, minTouchTarget: number): number {
  return Math.max(0, Math.ceil((minTouchTarget - contentHeight) / 2));
}
