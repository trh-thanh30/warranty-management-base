import { NotFoundError } from '@/common/response';
import { ActivateWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/activate-warranty-by-code.use-case';

describe('ActivateWarrantyByCodeUseCase', () => {
  const warrantiesRepository = {
    findActiveProductByWarrantyCode: jest.fn(),
  };
  const activateWarrantyUseCase = {
    execute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves the warranty code and delegates to the canonical activation use case', async () => {
    warrantiesRepository.findActiveProductByWarrantyCode.mockResolvedValue({
      id: 'product-id',
      warranty: { id: 'warranty-id' },
    });
    activateWarrantyUseCase.execute.mockResolvedValue({
      id: 'warranty-id',
      status: 'ACTIVE',
    });
    const useCase = new ActivateWarrantyByCodeUseCase(
      warrantiesRepository as never,
      activateWarrantyUseCase as never,
    );

    const result = await useCase.execute(
      {
        warrantyCode: 'wm-2026-abcdef',
        startDate: '2026-07-02',
      },
      { activatedByUserId: 'admin-id' },
    );

    expect(
      warrantiesRepository.findActiveProductByWarrantyCode,
    ).toHaveBeenCalledWith('WM-2026-ABCDEF');
    expect(activateWarrantyUseCase.execute).toHaveBeenCalledWith(
      'warranty-id',
      { warrantyCode: 'wm-2026-abcdef', startDate: '2026-07-02' },
      { activatedByUserId: 'admin-id' },
    );
    expect(result.status).toBe('ACTIVE');
  });

  it('throws not found when warranty code does not belong to an active product', async () => {
    warrantiesRepository.findActiveProductByWarrantyCode.mockResolvedValue(
      null,
    );
    const useCase = new ActivateWarrantyByCodeUseCase(
      warrantiesRepository as never,
      activateWarrantyUseCase as never,
    );

    await expect(
      useCase.execute({ warrantyCode: 'WM-2026-MISSING' }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(activateWarrantyUseCase.execute).not.toHaveBeenCalled();
  });
});
