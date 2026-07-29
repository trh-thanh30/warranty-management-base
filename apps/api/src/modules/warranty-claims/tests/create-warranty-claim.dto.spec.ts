import { CreateWarrantyClaimDto } from '@/modules/warranty-claims/dto/create-warranty-claim.dto';
import { validate } from 'class-validator';

describe('CreateWarrantyClaimDto', () => {
  it.each([
    ['requesterName', undefined],
    ['requesterName', '   '],
    ['requesterPhone', undefined],
    ['requesterPhone', '   '],
  ] as const)('rejects invalid required field %s', async (field, value) => {
    const dto = Object.assign(new CreateWarrantyClaimDto(), {
      issueTitle: 'Kinh bi bong',
      requesterName: 'Nguyen Van A',
      requesterPhone: '0901234567',
      warrantyCode: 'WM-2026-ABCDEF',
      [field]: value,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === field)).toBe(true);
  });
});
