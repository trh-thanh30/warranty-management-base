import { BadRequestError, NotFoundError } from '@/common/response';
import { UpdateWarrantyClaimStatusUseCase } from '@/modules/warranty-claims/use-cases/update-warranty-claim-status.use-case';
import { warranty_claim_status } from '@prisma/client';

describe('UpdateWarrantyClaimStatusUseCase', () => {
  const warrantyClaimsRepository = {
    findById: jest.fn(),
    updateStatusWithHistory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates claim status and sets resolved date for terminal statuses', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      status: warranty_claim_status.IN_REPAIR,
    });
    warrantyClaimsRepository.updateStatusWithHistory.mockResolvedValue({
      id: 'claim-id',
      claim_code: 'CLM-2026-ABC123',
      warranty_id: 'warranty-id',
      product_id: 'product-id',
      customer_id: null,
      warranty_code: 'WM-2026-ABCDEF',
      requester_name: null,
      requester_phone: null,
      issue_title: 'May khong hoat dong',
      issue_detail: null,
      status: warranty_claim_status.COMPLETED,
      submitted_at: new Date('2026-07-02T00:00:00.000Z'),
      resolved_at: new Date('2026-07-03T00:00:00.000Z'),
      created_at: new Date('2026-07-02T00:00:00.000Z'),
      updated_at: new Date('2026-07-03T00:00:00.000Z'),
    });
    const useCase = new UpdateWarrantyClaimStatusUseCase(
      warrantyClaimsRepository as never,
    );

    const result = await useCase.execute('claim-id', {
      status: warranty_claim_status.COMPLETED,
    });

    expect(
      warrantyClaimsRepository.updateStatusWithHistory,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'claim-id',
        fromStatus: warranty_claim_status.IN_REPAIR,
        toStatus: warranty_claim_status.COMPLETED,
        resolvedAt: expect.any(Date),
      }),
    );
    expect(result.status).toBe(warranty_claim_status.COMPLETED);
  });

  it('rejects invalid status transitions', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      status: warranty_claim_status.SUBMITTED,
    });
    const useCase = new UpdateWarrantyClaimStatusUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(
      useCase.execute('claim-id', {
        status: warranty_claim_status.COMPLETED,
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects duplicate status updates', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      status: warranty_claim_status.REVIEWING,
    });
    const useCase = new UpdateWarrantyClaimStatusUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(
      useCase.execute('claim-id', {
        status: warranty_claim_status.REVIEWING,
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws not found when claim does not exist', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue(null);
    const useCase = new UpdateWarrantyClaimStatusUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(
      useCase.execute('missing-id', {
        status: warranty_claim_status.REVIEWING,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
