import { BadRequestError, NotFoundError } from '@/common/response';
import { AssignWarrantyClaimServiceCenterUseCase } from '@/modules/warranty-claims/use-cases/assign-warranty-claim-service-center.use-case';
import { warranty_claim_status } from '@prisma/client';

describe('AssignWarrantyClaimServiceCenterUseCase', () => {
  const warrantyClaimsRepository = {
    findById: jest.fn(),
    findActiveServiceCenterById: jest.fn(),
    assignServiceCenter: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('assigns an active service center to a warranty claim', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      service_center_id: null,
      status: warranty_claim_status.APPROVED,
    });
    warrantyClaimsRepository.findActiveServiceCenterById.mockResolvedValue({
      id: 'service-center-id',
    });
    warrantyClaimsRepository.assignServiceCenter.mockResolvedValue({
      id: 'claim-id',
      claim_code: 'CLM000001',
      warranty_id: 'warranty-id',
      product_id: 'product-id',
      customer_id: null,
      service_center_id: 'service-center-id',
      warranty_code: 'WM-2026-ABCDEF',
      requester_name: null,
      requester_phone: null,
      issue_title: 'May khong hoat dong',
      issue_detail: null,
      status: warranty_claim_status.APPROVED,
      submitted_at: new Date('2026-07-02T00:00:00.000Z'),
      resolved_at: null,
      created_at: new Date('2026-07-02T00:00:00.000Z'),
      updated_at: new Date('2026-07-03T00:00:00.000Z'),
      service_center: {
        id: 'service-center-id',
        name: 'Tram Bao Hanh Ha Noi',
        phone: '0901234567',
        email: null,
        province: 'Ha Noi',
        district: null,
        address: '123 Pho Hue',
        is_active: true,
        created_at: new Date('2026-07-02T00:00:00.000Z'),
        updated_at: new Date('2026-07-02T00:00:00.000Z'),
      },
      status_history: [],
    });
    const useCase = new AssignWarrantyClaimServiceCenterUseCase(
      warrantyClaimsRepository as never,
    );

    const result = await useCase.execute(
      'claim-id',
      {
        serviceCenterId: 'service-center-id',
        note: 'Chuyen tram Ha Noi',
      },
      { changedByUserId: 'admin-id' },
    );

    expect(warrantyClaimsRepository.assignServiceCenter).toHaveBeenCalledWith({
      id: 'claim-id',
      fromServiceCenterId: null,
      serviceCenterId: 'service-center-id',
      note: 'Chuyen tram Ha Noi',
      changedByUserId: 'admin-id',
    });
    expect(result.serviceCenter?.id).toBe('service-center-id');
  });

  it('throws not found when the claim is absent', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue(null);
    const useCase = new AssignWarrantyClaimServiceCenterUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(
      useCase.execute('missing-id', {
        serviceCenterId: 'service-center-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws not found when the service center is inactive or absent', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      service_center_id: null,
      status: warranty_claim_status.APPROVED,
    });
    warrantyClaimsRepository.findActiveServiceCenterById.mockResolvedValue(
      null,
    );
    const useCase = new AssignWarrantyClaimServiceCenterUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(
      useCase.execute('claim-id', {
        serviceCenterId: 'missing-service-center-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects assigning the same service center again', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      service_center_id: 'service-center-id',
      status: warranty_claim_status.APPROVED,
    });
    const useCase = new AssignWarrantyClaimServiceCenterUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(
      useCase.execute('claim-id', {
        serviceCenterId: 'service-center-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it.each([
    warranty_claim_status.COMPLETED,
    warranty_claim_status.REJECTED,
    warranty_claim_status.CANCELLED,
  ])('rejects assigning a service center when claim is %s', async (status) => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      service_center_id: null,
      status,
    });
    const useCase = new AssignWarrantyClaimServiceCenterUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(
      useCase.execute('claim-id', {
        serviceCenterId: 'service-center-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(
      warrantyClaimsRepository.findActiveServiceCenterById,
    ).not.toHaveBeenCalled();
  });

  it('requires a reason when moving a claim from another service center', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      service_center_id: 'old-service-center-id',
      status: warranty_claim_status.IN_REPAIR,
    });
    const useCase = new AssignWarrantyClaimServiceCenterUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(
      useCase.execute('claim-id', {
        serviceCenterId: 'new-service-center-id',
        note: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(
      warrantyClaimsRepository.findActiveServiceCenterById,
    ).not.toHaveBeenCalled();
  });

  it('records the previous center when reassigning an in-repair claim', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      service_center_id: 'old-service-center-id',
      status: warranty_claim_status.IN_REPAIR,
    });
    warrantyClaimsRepository.findActiveServiceCenterById.mockResolvedValue({
      id: 'new-service-center-id',
    });
    warrantyClaimsRepository.assignServiceCenter.mockResolvedValue({
      id: 'claim-id',
      claim_code: 'CLM000001',
      warranty_id: 'warranty-id',
      product_id: 'product-id',
      customer_id: null,
      service_center_id: 'new-service-center-id',
      warranty_code: 'WM-2026-ABCDEF',
      requester_name: null,
      requester_phone: null,
      issue_title: 'May khong hoat dong',
      issue_detail: null,
      status: warranty_claim_status.IN_REPAIR,
      submitted_at: new Date('2026-07-02T00:00:00.000Z'),
      resolved_at: null,
      created_at: new Date('2026-07-02T00:00:00.000Z'),
      updated_at: new Date('2026-07-03T00:00:00.000Z'),
      status_history: [],
    });
    const useCase = new AssignWarrantyClaimServiceCenterUseCase(
      warrantyClaimsRepository as never,
    );

    await useCase.execute(
      'claim-id',
      {
        serviceCenterId: 'new-service-center-id',
        note: 'Tram cu thieu linh kien',
      },
      { changedByUserId: 'admin-id' },
    );

    expect(warrantyClaimsRepository.assignServiceCenter).toHaveBeenCalledWith({
      id: 'claim-id',
      fromServiceCenterId: 'old-service-center-id',
      serviceCenterId: 'new-service-center-id',
      note: 'Tram cu thieu linh kien',
      changedByUserId: 'admin-id',
    });
  });
});
