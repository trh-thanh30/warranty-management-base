import 'reflect-metadata';
import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { ManualWarrantyActivationWarrantyDto } from '@/modules/warranties/dto/manual-warranty-activation.dto';
import { UpdateWarrantyDto } from '@/modules/warranties/dto/update-warranty.dto';
import { validate } from 'class-validator';

describe('warranty duration validation', () => {
  it.each([
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
