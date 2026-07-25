import {
  createProductSlug,
  toProductSlug,
} from '@/modules/products/product-slug.utils';

describe('product slug utilities', () => {
  it('normalizes Vietnamese product names for public URLs', () => {
    expect(toProductSlug('  Phim cách nhiệt Đặc Biệt  ')).toBe(
      'phim-cach-nhiet-dac-biet',
    );
  });

  it('adds the product code to generated slugs to keep them stable and unique', () => {
    expect(createProductSlug('Phim cách nhiệt', 'PRD-000123')).toBe(
      'phim-cach-nhiet-prd-000123',
    );
  });
});
