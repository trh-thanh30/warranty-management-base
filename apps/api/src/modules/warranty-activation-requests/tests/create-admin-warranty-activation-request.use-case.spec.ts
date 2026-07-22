import { BadRequestError } from '@/common/response';
import { CreateAdminWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-admin-warranty-activation-request.use-case';
import { product_status, warranty_status } from '@prisma/client';

describe('CreateAdminWarrantyActivationRequestUseCase', () => {
  const productsRepository = {
    findActivationRequestTargetById: jest.fn(),
    synchronizeWarrantyCode: jest.fn(),
  };
  const generateWarrantyCodeUseCase = { execute: jest.fn() };
  const createWarrantyActivationRequestUseCase = { execute: jest.fn() };
  const dto = {
    productId: '23684bbd-b6e0-401a-9ba4-97e1b98176fd',
    addressDetail: '1 Nguyen Trai',
    customerEmail: 'customer@example.com',
    customerName: 'Nguyen Van A',
    customerPhone: '0901234567',
    provinceCode: '79',
    provinceName: 'TP Ho Chi Minh',
    wardCode: '26734',
    wardName: 'Phuong Ben Thanh',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates and synchronizes a missing warranty code before creating the request', async () => {
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      id: dto.productId,
      brand: 'Toyota',
      manufacture_year: 2026,
      model: 'Battery Plus',
      name: 'Bo pin chinh hang',
      serial_number: 'SN-001',
      status: product_status.ACTIVE,
      warranty_code: null,
      warranty: {
        id: 'warranty-id',
        status: warranty_status.DRAFT,
        warranty_code: null,
      },
    });
    generateWarrantyCodeUseCase.execute.mockResolvedValue('WM-2026-ABC123');
    createWarrantyActivationRequestUseCase.execute.mockResolvedValue({
      id: 'request-id',
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
    );

    const result = await useCase.execute(dto);

    expect(productsRepository.synchronizeWarrantyCode).toHaveBeenCalledWith({
      productId: dto.productId,
      warrantyCode: 'WM-2026-ABC123',
      warrantyId: 'warranty-id',
    });
    expect(createWarrantyActivationRequestUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        brand: 'Toyota',
        productName: 'Bo pin chinh hang',
        serialNumber: 'SN-001',
        warrantyCode: 'WM-2026-ABC123',
      }),
    );
    expect(result).toEqual({ id: 'request-id' });
  });

  it('reuses an existing warranty code without synchronizing it', async () => {
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      id: dto.productId,
      status: product_status.ACTIVE,
      warranty_code: 'WM-2026-EXISTING',
      warranty: {
        id: 'warranty-id',
        status: warranty_status.DRAFT,
        warranty_code: 'WM-2026-EXISTING',
      },
    });
    createWarrantyActivationRequestUseCase.execute.mockResolvedValue({
      id: 'request-id',
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
    );

    await useCase.execute(dto);

    expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
    expect(productsRepository.synchronizeWarrantyCode).not.toHaveBeenCalled();
    expect(createWarrantyActivationRequestUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ warrantyCode: 'WM-2026-EXISTING' }),
    );
  });

  it('rejects products whose warranty is not draft', async () => {
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      id: dto.productId,
      status: product_status.ACTIVE,
      warranty_code: 'WM-2026-ACTIVE1',
      warranty: {
        id: 'warranty-id',
        status: warranty_status.ACTIVE,
        warranty_code: 'WM-2026-ACTIVE1',
      },
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
    );

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(BadRequestError);
    expect(
      createWarrantyActivationRequestUseCase.execute,
    ).not.toHaveBeenCalled();
  });
});
