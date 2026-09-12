import { GenerateWarrantyClaimCodeUseCase } from '@/modules/warranty-claims/use-cases/generate-warranty-claim-code.use-case';

describe('GenerateWarrantyClaimCodeUseCase', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-08T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('generates a year-prefixed tracking code with six readable random characters', async () => {
    const useCase = new GenerateWarrantyClaimCodeUseCase();

    await expect(useCase.generateWarrantyClaimCode()).resolves.toMatch(
      /^CLM-2026-[A-HJ-NP-Z2-9]{6}$/,
    );
  });

  it('generates a unique random batch', async () => {
    const useCase = new GenerateWarrantyClaimCodeUseCase();

    const codes = await useCase.generateWarrantyClaimCodeBatch(100);

    expect(codes).toHaveLength(100);
    expect(new Set(codes).size).toBe(100);
    for (const code of codes) {
      expect(code).toMatch(/^CLM-2026-[A-HJ-NP-Z2-9]{6}$/);
    }
  });

  it('keeps execute as a compatibility alias for single code generation', async () => {
    const useCase = new GenerateWarrantyClaimCodeUseCase();

    await expect(useCase.execute()).resolves.toMatch(
      /^CLM-2026-[A-HJ-NP-Z2-9]{6}$/,
    );
  });

  it('uses the current year instead of a hard-coded year', async () => {
    jest.setSystemTime(new Date('2027-07-08T12:00:00Z'));
    await expect(
      new GenerateWarrantyClaimCodeUseCase().execute(),
    ).resolves.toMatch(/^CLM-2027-[A-HJ-NP-Z2-9]{6}$/);
  });
});
