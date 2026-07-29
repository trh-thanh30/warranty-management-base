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
  it('defines 24 unique templates split evenly across the production categories', () => {
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

  it('upserts published catalog templates without physical products', async () => {
    const productTemplateUpsert = jest.fn(
      ({ where }: Prisma.ProductTemplateUpsertArgs) =>
        Promise.resolve({ id: `template-${where.sku}` }),
    );
    const client = {
      category: {
        findMany: jest.fn(() =>
          Promise.resolve(
            Array.from(categoryIds, ([code, id]) => ({ code, id })),
          ),
        ),
      },
      productTemplate: { upsert: productTemplateUpsert },
    };

    await seedLexzenzProducts(client);

    expect(productTemplateUpsert).toHaveBeenCalledTimes(24);

    for (const call of productTemplateUpsert.mock.calls) {
      const input = call[0];
      expect(input.create).toMatchObject({
        is_active: true,
        is_published: true,
      });
      expect(input.create.published_at).toBeInstanceOf(Date);
      expect(input.update).toMatchObject({
        is_active: true,
        is_published: true,
      });
      expect(input.update.published_at).toBeInstanceOf(Date);
      expect(input.create).not.toHaveProperty('assets');
      expect(input.update).not.toHaveProperty('assets');
      expect(input.create.metadata).toEqual(
        expect.objectContaining({
          shortDescription: expect.any(String),
          specifications: expect.any(Array),
          features: expect.arrayContaining([expect.any(String)]),
          applications: expect.arrayContaining([expect.any(String)]),
        }),
      );
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
      productTemplate: { upsert: jest.fn() },
    };

    await expect(seedLexzenzProducts(client)).rejects.toThrow(
      'Missing product categories',
    );
    expect(client.productTemplate.upsert).not.toHaveBeenCalled();
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
