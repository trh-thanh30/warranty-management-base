import {
  filmActivationFieldSeeds,
  type LexzenzCategorySeedClient,
  seedLexzenzProductCategories,
} from '../../../../prisma/seed-categories';
import { Prisma } from '@prisma/client';

describe('Lexzenz category seed', () => {
  it('initializes the seven Film product selectors when configuration is empty', async () => {
    const categoryUpsert = jest.fn(({ create }: Prisma.CategoryUpsertArgs) =>
      Promise.resolve({
        id: `category-${String(Reflect.get(create, 'code'))}`,
      }),
    );
    const categoryUpdate = jest.fn(() => Promise.resolve());
    const activationFieldCount = jest.fn(() => Promise.resolve(0));
    const activationFieldCreateMany = jest.fn(() =>
      Promise.resolve({ count: filmActivationFieldSeeds.length }),
    );
    const transactionClient = {
      category: { update: categoryUpdate },
      categoryActivationField: {
        count: activationFieldCount,
        createMany: activationFieldCreateMany,
      },
    };
    const client: LexzenzCategorySeedClient = {
      async $transaction<T>(
        operation: (tx: typeof transactionClient) => Promise<T>,
      ) {
        return operation(transactionClient);
      },
      category: { upsert: categoryUpsert },
    };

    await seedLexzenzProductCategories(client);

    const filmUpsert = categoryUpsert.mock.calls.find(
      ([input]) =>
        Reflect.get(input.create, 'code') === 'LEXZENZ_REFLEX_KOREA_FILM',
    )?.[0];
    const nonFilmUpserts = categoryUpsert.mock.calls.filter(
      ([input]) =>
        Reflect.get(input.create, 'code') !== 'LEXZENZ_REFLEX_KOREA_FILM',
    );

    expect(filmUpsert?.create).toMatchObject({
      activation_code_enabled: false,
    });
    expect(filmUpsert?.update).toMatchObject({
      activation_code_enabled: false,
    });
    expect(
      nonFilmUpserts.every(
        ([input]) =>
          Reflect.get(input.create, 'activation_code_enabled') === true &&
          Reflect.get(input.update, 'activation_code_enabled') === true,
      ),
    ).toBe(true);

    expect(filmActivationFieldSeeds.map((field) => field.key)).toEqual([
      'windshield',
      'frontLeftSide',
      'frontRightSide',
      'rearLeftSide',
      'rearRightSide',
      'rearGlass',
      'sunroof',
    ]);
    expect(filmActivationFieldSeeds.every((field) => !field.required)).toBe(
      true,
    );
    expect(activationFieldCount).toHaveBeenCalledWith({
      where: { category_id: 'category-LEXZENZ_REFLEX_KOREA_FILM' },
    });
    expect(categoryUpdate).toHaveBeenCalledWith({
      data: { activation_form_enabled: true },
      where: { id: 'category-LEXZENZ_REFLEX_KOREA_FILM' },
    });
    expect(activationFieldCreateMany).toHaveBeenCalledWith({
      data: filmActivationFieldSeeds.map((field, index) => ({
        category_id: 'category-LEXZENZ_REFLEX_KOREA_FILM',
        key: field.key,
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
        sort_order: index + 1,
        type: 'PRODUCT_SELECT',
      })),
    });
  });

  it('preserves an existing Film activation configuration', async () => {
    const categoryUpdate = jest.fn();
    const activationFieldCreateMany = jest.fn();
    const transactionClient = {
      category: { update: categoryUpdate },
      categoryActivationField: {
        count: jest.fn(() => Promise.resolve(1)),
        createMany: activationFieldCreateMany,
      },
    };
    const client: LexzenzCategorySeedClient = {
      async $transaction<T>(
        operation: (tx: typeof transactionClient) => Promise<T>,
      ) {
        return operation(transactionClient);
      },
      category: {
        upsert: jest.fn(({ create }: Prisma.CategoryUpsertArgs) =>
          Promise.resolve({
            id: `category-${String(Reflect.get(create, 'code'))}`,
          }),
        ),
      },
    };

    await seedLexzenzProductCategories(client);

    expect(categoryUpdate).not.toHaveBeenCalled();
    expect(activationFieldCreateMany).not.toHaveBeenCalled();
  });
});
