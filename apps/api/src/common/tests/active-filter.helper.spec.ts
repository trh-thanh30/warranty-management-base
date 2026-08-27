import { resolveActiveFilter } from '@/common/helpers/active-filter.helper';

describe('resolveActiveFilter', () => {
  it('defaults to active records', () => {
    expect(resolveActiveFilter(undefined)).toBe(true);
  });

  it.each([
    ['true', true],
    ['false', false],
    ['all', undefined],
  ] as const)('maps %s to %s', (value, expected) => {
    expect(resolveActiveFilter(value)).toBe(expected);
  });
});
