import { touchSlop } from '../touchTarget';

describe('touchSlop', () => {
  it('AC-31: a 26pt pill gets 11pt of slop each side to reach a 48pt target', () => {
    expect(26 + touchSlop(26, 48) * 2).toBeGreaterThanOrEqual(48);
    expect(touchSlop(26, 48)).toBe(11);
  });

  it('needs no slop when the content is already the minimum size', () => {
    expect(touchSlop(48, 48)).toBe(0);
    expect(touchSlop(60, 48)).toBe(0);
  });
});
