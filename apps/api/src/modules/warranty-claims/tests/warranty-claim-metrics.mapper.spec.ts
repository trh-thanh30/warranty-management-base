import { calculateAverageResolutionHours } from '@/modules/warranty-claims/mappers/warranty-claim-metrics.mapper';

describe('calculateAverageResolutionHours', () => {
  it('returns null when there are no resolved claims', () => {
    expect(calculateAverageResolutionHours([])).toBeNull();
  });

  it('calculates the average duration in hours', () => {
    expect(
      calculateAverageResolutionHours([
        {
          created_at: new Date('2026-07-20T08:00:00.000Z'),
          resolved_at: new Date('2026-07-20T12:00:00.000Z'),
        },
        {
          created_at: new Date('2026-07-21T08:00:00.000Z'),
          resolved_at: new Date('2026-07-21T14:00:00.000Z'),
        },
      ]),
    ).toBe(5);
  });
});
