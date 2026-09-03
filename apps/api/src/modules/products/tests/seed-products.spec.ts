import {
  lexzenzProductSeeds,
  seedLexzenzProducts,
} from '../../../../prisma/seed-products';
import { Prisma } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const categoryIds = new Map([
  ['LEXZENZ_REFLEX_KOREA_FILM', 'category-film'],
  ['LEXZENZ_LED_FUJITEK', 'category-lighting'],
  ['LEXZENZ_DASHCAM', 'category-dashcam'],
  ['LEXZENZ_TPMS', 'category-tpms'],
]);

describe('Lexzenz product seed', () => {
  it('defines 24 unique catalogue products split evenly across the production categories', () => {
    expect(lexzenzProductSeeds).toHaveLength(24);
    expect(new Set(lexzenzProductSeeds.map((item) => item.sku)).size).toBe(24);
    expect(new Set(lexzenzProductSeeds.map((item) => item.slug)).size).toBe(24);
    for (const categoryCode of categoryIds.keys()) {
      expect(
        lexzenzProductSeeds.filter(
          (item) => item.categoryCode === categoryCode,
        ),
      ).toHaveLength(6);
    }
  });

  it('upserts one published product per SKU without pre-issuing warranties', async () => {
    const productUpsert = jest.fn(({ where }: Prisma.ProductUpsertArgs) =>
      Promise.resolve({ id: `product-${where.product_code}` }),
    );
    const client = {
      category: {
        findMany: jest.fn(() =>
          Promise.resolve(
            Array.from(categoryIds, ([code, id]) => ({ code, id })),
          ),
        ),
      },
      product: { upsert: productUpsert },
    };

    await seedLexzenzProducts(client);

    expect(productUpsert).toHaveBeenCalledTimes(24);

    const productCodes = productUpsert.mock.calls.map(
      ([input]) => input.create.product_code,
    );
    const serialNumbers = productUpsert.mock.calls.map(
      ([input]) => input.create.serial_number,
    );
    const displayNames = productUpsert.mock.calls.map(
      ([input]) => input.create.display_name,
    );

    expect(new Set(productCodes).size).toBe(24);
    expect(serialNumbers.every((serialNumber) => serialNumber === null)).toBe(
      true,
    );
    expect(new Set(displayNames).size).toBe(24);
    expect(displayNames).toContain('Cảm biến áp suất lốp Pro 6 bánh');

    for (const [input] of productUpsert.mock.calls) {
      const catalogueSku = input.create.product_code.replace(/^PRD-/, '');

      expect(input.create).toMatchObject({
        category_id: categoryIds.get(
          lexzenzProductSeeds.find((seed) => seed.sku === catalogueSku)!
            .categoryCode,
        ),
        is_published: true,
        metadata: expect.objectContaining({
          shortDescription: expect.any(String),
          specifications: expect.any(Array),
          features: expect.arrayContaining([expect.any(String)]),
          applications: expect.arrayContaining([expect.any(String)]),
        }),
        published_at: expect.any(Date),
        warranty_duration_months: expect.any(Number),
        warranty_method: 'REPAIR',
        display_name: expect.any(String),
        status: 'ACTIVE',
      });
      expect(input.create).not.toHaveProperty('template_id');
      expect(input.update).toMatchObject({
        category_id: input.create.category_id,
        deleted_at: null,
        display_name: input.create.display_name,
        serial_number: input.create.serial_number,
        status: 'ACTIVE',
      });
      expect(input.update).not.toHaveProperty('template_id');
    }
  });

  it('fails before writing when a required category is missing', async () => {
    const client = {
      category: {
        findMany: jest.fn(() =>
          Promise.resolve([
            {
              code: 'LEXZENZ_REFLEX_KOREA_FILM',
              id: 'category-film',
            },
          ]),
        ),
      },
      product: { upsert: jest.fn() },
    };

    await expect(seedLexzenzProducts(client)).rejects.toThrow(
      'Missing product categories',
    );
    expect(client.product.upsert).not.toHaveBeenCalled();
  });

  it('runs after category seed in production and exposes environment scripts', () => {
    const productionSeed = readFileSync(
      resolve(__dirname, '../../../../prisma/seed.production.ts'),
      'utf8',
    );
    const packageJson = readFileSync(
      resolve(__dirname, '../../../../package.json'),
      'utf8',
    );
    const rootPackageJson = readFileSync(
      resolve(__dirname, '../../../../../../package.json'),
      'utf8',
    );
    const categorySeedIndex = productionSeed.indexOf(
      'await seedLexzenzProductCategories(prisma)',
    );
    const productSeedIndex = productionSeed.indexOf(
      'await seedLexzenzProducts(prisma)',
    );

    expect(categorySeedIndex).toBeGreaterThan(-1);
    expect(productSeedIndex).toBeGreaterThan(categorySeedIndex);
    expect(packageJson).toMatch(
      /"db:seed-products:dev": "[^"]*prisma\/seed-products\.ts"/,
    );
    expect(packageJson).toMatch(
      /"db:seed-products:test": "[^"]*prisma\/seed-products\.ts"/,
    );
    expect(packageJson).toMatch(
      /"db:seed-products:prod": "[^"]*prisma\/seed-products\.ts"/,
    );
    expect(rootPackageJson).toMatch(
      /"seed:products:dev": "pnpm --filter @repo\/api db:seed-products:dev"/,
    );
    expect(rootPackageJson).toMatch(
      /"seed:products:test": "pnpm --filter @repo\/api db:seed-products:test"/,
    );
    expect(rootPackageJson).toMatch(
      /"seed:products:prod": "pnpm --filter @repo\/api db:seed-products:prod"/,
    );
  });
});
