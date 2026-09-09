import { BadRequestError, NotFoundError } from '@/common/response';
import { UpdateAdminWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/update-admin-warranty-activation-request.use-case';

describe('UpdateAdminWarrantyActivationRequestUseCase', () => {
  const repository = { findById: jest.fn() };
  const createAdminUseCase = { execute: jest.fn() };
  const dealerAccessPolicy = { resolveAccessibleDealerIds: jest.fn() };
  const dto = {
    customerId: '68a1578a-b13e-45de-b008-e357392be715',
    customerName: 'Nguyen Van A',
    customerPhone: '0901234567',
    addressDetail: '1 Nguyen Trai',
    provinceCode: '79',
    provinceName: 'TP Ho Chi Minh',
    wardCode: '26734',
    wardName: 'Phuong Ben Thanh',
    productId: '23684bbd-b6e0-401a-9ba4-97e1b98176fd',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dealerAccessPolicy.resolveAccessibleDealerIds.mockResolvedValue(undefined);
  });

  it('updates a pending request through the existing validated admin flow', async () => {
    repository.findById.mockResolvedValue({
      id: 'request-id',
      request_code: 'WAR-20260909-0001',
      warranty_code: 'WM-EXISTING',
      items: [
        {
          activation_code_id: 'code-id',
          position_key: 'primaryProduct',
          product_id: dto.productId,
          warranty_code: 'WM-EXISTING',
        },
      ],
      status: 'PENDING',
    });
    createAdminUseCase.execute.mockResolvedValue({ id: 'request-id' });
    const useCase = new UpdateAdminWarrantyActivationRequestUseCase(
      repository as never,
      createAdminUseCase as never,
      dealerAccessPolicy as never,
    );

    const result = await useCase.execute('request-id', dto, {
      id: 'admin-id',
      role: 'ADMIN',
    });

    expect(createAdminUseCase.execute).toHaveBeenCalledWith(dto, {
      actor: { id: 'admin-id', role: 'ADMIN' },
      updateRequest: {
        id: 'request-id',
        items: [
          {
            activationCodeId: 'code-id',
            positionKey: 'primaryProduct',
            productId: dto.productId,
            warrantyCode: 'WM-EXISTING',
          },
        ],
        requestCode: 'WAR-20260909-0001',
        warrantyCode: 'WM-EXISTING',
      },
    });
    expect(result).toEqual({ id: 'request-id' });
  });

  it('rejects an update after the request leaves pending status', async () => {
    repository.findById.mockResolvedValue({
      id: 'request-id',
      request_code: 'WAR-20260909-0001',
      warranty_code: 'WM-EXISTING',
      items: [],
      status: 'APPROVED',
    });
    const useCase = new UpdateAdminWarrantyActivationRequestUseCase(
      repository as never,
      createAdminUseCase as never,
      dealerAccessPolicy as never,
    );

    await expect(
      useCase.execute('request-id', dto, { id: 'admin-id', role: 'ADMIN' }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(createAdminUseCase.execute).not.toHaveBeenCalled();
  });

  it('does not expose a request outside the actor dealer scope', async () => {
    dealerAccessPolicy.resolveAccessibleDealerIds.mockResolvedValue([
      'dealer-id',
    ]);
    repository.findById.mockResolvedValue(null);
    const useCase = new UpdateAdminWarrantyActivationRequestUseCase(
      repository as never,
      createAdminUseCase as never,
      dealerAccessPolicy as never,
    );

    await expect(
      useCase.execute('request-id', dto, { id: 'staff-id', role: 'STAFF' }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repository.findById).toHaveBeenCalledWith('request-id', [
      'dealer-id',
    ]);
  });
});
