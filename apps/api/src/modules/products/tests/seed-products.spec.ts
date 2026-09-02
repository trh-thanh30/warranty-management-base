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

  it('upserts two published physical products for each catalogue definition', async () => {
    const productUpsert = jest.fn(({ where }: Prisma.ProductUpsertArgs) =>
      Promise.resolve({ id: `product-${where.product_code}` }),
    );
    const warrantyUpsert = jest.fn(({ where }: Prisma.WarrantyUpsertArgs) =>
      Promise.resolve({ id: `warranty-${where.product_id}` }),
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
      warranty: { upsert: warrantyUpsert },
    };

    await seedLexzenzProducts(client);

    expect(productUpsert).toHaveBeenCalledTimes(48);
    expect(warrantyUpsert).toHaveBeenCalledTimes(48);

    const productCodes = productUpsert.mock.calls.map(
      ([input]) => input.create.product_code,
    );
    const serialNumbers = productUpsert.mock.calls.map(
      ([input]) => input.create.serial_number,
    );
    const warrantyCodes = warrantyUpsert.mock.calls.map(
      ([input]) => input.create.warranty_code,
    );
    const displayNames = productUpsert.mock.calls.map(
      ([input]) => input.create.display_name,
    );

    expect(new Set(productCodes).size).toBe(48);
    expect(new Set(serialNumbers).size).toBe(48);
    expect(new Set(warrantyCodes).size).toBe(48);
    expect(new Set(displayNames).size).toBe(48);
    expect(displayNames).toContain('Cảm biến áp suất lốp Pro 6 bánh #01');
    expect(displayNames).toContain('Cảm biến áp suất lốp Pro 6 bánh #02');

    for (const [input] of productUpsert.mock.calls) {
      const catalogueSku = input.create.product_code
        .replace(/^PRD-/, '')
        .replace(/-\d{2}$/, '');

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

    for (const [input] of warrantyUpsert.mock.calls) {
      expect(input.create).toMatchObject({
        duration_months: expect.any(Number),
        end_date: null,
        product_id: expect.stringMatching(/^product-PRD-/),
        start_date: null,
        status: 'DRAFT',
        warranty_code: expect.stringMatching(
          /^WM-2026-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/,
        ),
      });
      expect(input.update).toMatchObject({
        duration_months: input.create.duration_months,
        end_date: null,
        start_date: null,
        status: 'DRAFT',
        warranty_code: input.create.warranty_code,
      });
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
      warranty: { upsert: jest.fn() },
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
