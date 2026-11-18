import { sameId } from './id';

describe('sameId', () => {
  it('matches numeric ids represented as numbers or strings', () => {
    expect(sameId(1, '1')).toBe(true);
    expect(sameId('01', 1)).toBe(true);
  });

  it('matches opaque string ids exactly and excludes missing ids', () => {
    expect(sameId('abc', 'abc')).toBe(true);
    expect(sameId('abc', 'ABC')).toBe(false);
    expect(sameId(undefined, undefined)).toBe(false);
  });
});
