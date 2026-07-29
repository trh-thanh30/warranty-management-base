import 'reflect-metadata';
import { CreateProductTemplateDto } from '@/modules/product-templates/dto/create-product-template.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateProductTemplateDto metadata', () => {
  const baseInput = {
    categoryId: '62a67f1c-4e8b-45a6-ac07-dfeaf40f1244',
    name: 'Product template',
  };

  it('accepts the supported public product detail metadata', async () => {
    const dto = plainToInstance(CreateProductTemplateDto, {
      ...baseInput,
      metadata: {
        applications: ['Windshield'],
        features: ['Heat rejection'],
        shortDescription: 'Short public summary',
        specifications: [{ key: 'UV protection', value: '99%' }],
      },
    });

    await expect(validate(dto)).resolves.toEqual([]);
  });

  it('rejects invalid nested public product detail metadata', async () => {
    const dto = plainToInstance(CreateProductTemplateDto, {
      ...baseInput,
      metadata: {
        features: [42],
        specifications: [{ key: '', value: '99%' }],
      },
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'metadata')).toBe(true);
  });

  it('rejects new extension keys from write requests', async () => {
    const dto = plainToInstance(CreateProductTemplateDto, {
      ...baseInput,
      metadata: {
        integrationCode: 'external-value',
      },
    });

    const errors = await validate(dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });

    expect(errors).toEqual([
      expect.objectContaining({
        property: 'metadata',
        children: [
          expect.objectContaining({
            property: 'integrationCode',
          }),
        ],
      }),
    ]);
  });
});
