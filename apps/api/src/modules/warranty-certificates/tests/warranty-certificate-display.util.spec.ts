import {
  formatWarrantyCertificateValue,
  formatWarrantyPeriod,
} from '@/modules/warranty-certificates/utils/warranty-certificate-display.util';

describe('warranty certificate display formatting', () => {
  it.each([null, undefined, '', '   ', '-'])(
    'renders missing value %p as Không',
    (value) => {
      expect(formatWarrantyCertificateValue(value)).toBe('Không');
    },
  );

  it('renders the warranty duration and end date on one line', () => {
    expect(formatWarrantyPeriod(36, new Date('2029-07-24T00:00:00.000Z'))).toBe(
      '36 tháng - 24/7/2029',
    );
  });
});
