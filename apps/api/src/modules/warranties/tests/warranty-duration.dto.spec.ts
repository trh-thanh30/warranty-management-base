import 'reflect-metadata';
import { CreateProductTemplateDto } from '@/modules/product-templates/dto/create-product-template.dto';
import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { ManualWarrantyActivationWarrantyDto } from '@/modules/warranties/dto/manual-warranty-activation.dto';
import { UpdateWarrantyDto } from '@/modules/warranties/dto/update-warranty.dto';
import { validate } from 'class-validator';

describe('warranty duration validation', () => {
  it.each([
    [
      CreateProductTemplateDto,
      'defaultWarrantyDurationMonths',
      {
        categoryId: '62a67f1c-4e8b-45a6-ac07-dfeaf40f1244',
        name: 'Product template',
      },
    ],
    [CreateWarrantyActivationRequestDto, 'warrantyDurationMonths', {}],
    [
      ManualWarrantyActivationWarrantyDto,
      'durationMonths',
      { activatedAt: '2026-08-07T00:00:00.000Z' },
    ],
    [UpdateWarrantyDto, 'durationMonths', { adjustmentReason: 'Correction' }],
  ])(
    '%p accepts a duration above 120 months',
    async (Dto, field, baseInput) => {
      const DtoClass = Dto as new () => object;
      const dto = Object.assign(new DtoClass(), {
        ...baseInput,
        [field]: 180,
      });
      const errors = await validate(dto);

      expect(errors.find((error) => error.property === field)).toBeUndefined();
    },
  );
});
