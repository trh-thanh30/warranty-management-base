import { GenerateWarrantyClaimCodeUseCase } from '@/modules/warranty-claims/use-cases/generate-warranty-claim-code.use-case';

describe('GenerateWarrantyClaimCodeUseCase', () => {
  const warrantyClaimsRepository = {
    findLastClaimCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts at CLM000001 when no prior claim code exists', async () => {
    warrantyClaimsRepository.findLastClaimCode.mockResolvedValue(null);
    const useCase = new GenerateWarrantyClaimCodeUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(useCase.generateWarrantyClaimCode()).resolves.toBe(
      'CLM000001',
    );
    expect(warrantyClaimsRepository.findLastClaimCode).toHaveBeenCalledWith(
      'CLM',
    );
  });

  it('generates a sequential batch after the last claim code', async () => {
    warrantyClaimsRepository.findLastClaimCode.mockResolvedValue({
      claim_code: 'CLM000099',
    });
    const useCase = new GenerateWarrantyClaimCodeUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(useCase.generateWarrantyClaimCodeBatch(3)).resolves.toEqual([
      'CLM000100',
      'CLM000101',
      'CLM000102',
    ]);
  });

  it('keeps execute as a compatibility alias for single code generation', async () => {
    warrantyClaimsRepository.findLastClaimCode.mockResolvedValue({
      claim_code: 'CLM000001',
    });
    const useCase = new GenerateWarrantyClaimCodeUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(useCase.execute()).resolves.toBe('CLM000002');
  });

  it('starts a new sequential range when the last matching code is legacy format', async () => {
    warrantyClaimsRepository.findLastClaimCode.mockResolvedValue({
      claim_code: 'CLM-2026-ABC123',
    });
    const useCase = new GenerateWarrantyClaimCodeUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(useCase.generateWarrantyClaimCode()).resolves.toBe(
      'CLM000001',
    );
  });
});
