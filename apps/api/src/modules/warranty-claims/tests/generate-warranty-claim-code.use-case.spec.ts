import { GenerateWarrantyClaimCodeUseCase } from '@/modules/warranty-claims/use-cases/generate-warranty-claim-code.use-case';

describe('GenerateWarrantyClaimCodeUseCase', () => {
  it('generates an 80-bit random public tracking code', async () => {
    const useCase = new GenerateWarrantyClaimCodeUseCase();

    await expect(useCase.generateWarrantyClaimCode()).resolves.toMatch(
      /^CLM-[A-F0-9]{20}$/,
    );
  });

  it('generates a unique random batch', async () => {
    const useCase = new GenerateWarrantyClaimCodeUseCase();

    const codes = await useCase.generateWarrantyClaimCodeBatch(100);

    expect(codes).toHaveLength(100);
    expect(new Set(codes).size).toBe(100);
    expect(codes).toEqual(
      expect.arrayContaining([expect.stringMatching(/^CLM-[A-F0-9]{20}$/)]),
    );
  });

  it('keeps execute as a compatibility alias for single code generation', async () => {
    const useCase = new GenerateWarrantyClaimCodeUseCase();

    await expect(useCase.execute()).resolves.toMatch(/^CLM-[A-F0-9]{20}$/);
  });
});
