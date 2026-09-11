import { BadRequestError, NotFoundError } from '@/common/response';
import { CompleteWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/complete-warranty-claim.use-case';
import { warranty_claim_status } from '@prisma/client';

describe('CompleteWarrantyClaimUseCase', () => {
  const warrantyClaimsRepository = {
    findById: jest.fn(),
    updateStatusWithHistory: jest.fn(),
  };
  const warrantyClaimNotificationService = {
    slaBreached: jest.fn(),
    statusChanged: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    warranty_claim_status.SUBMITTED,
    warranty_claim_status.REVIEWING,
    warranty_claim_status.APPROVED,
    warranty_claim_status.IN_REPAIR,
  ])('completes a claim directly from %s', async (status) => {
    const existingClaim = {
      id: 'claim-id',
      status,
      due_at: null,
      sla_breached_at: null,
    };
    warrantyClaimsRepository.findById.mockResolvedValue(existingClaim);
    warrantyClaimsRepository.updateStatusWithHistory.mockResolvedValue({
      ...existingClaim,
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
    const useCase = new CompleteWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      undefined,
      warrantyClaimNotificationService as never,
    );

    const result = await useCase.execute(
      'claim-id',
      { note: '  Hoan tat nhanh  ' },
      { changedByUserId: 'user-id' },
    );

    expect(
      warrantyClaimsRepository.updateStatusWithHistory,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'claim-id',
        fromStatus: status,
        toStatus: warranty_claim_status.COMPLETED,
        resolvedAt: expect.any(Date),
        note: 'Hoan tat nhanh',
        changedByUserId: 'user-id',
      }),
    );
    expect(warrantyClaimNotificationService.statusChanged).toHaveBeenCalled();
    expect(result.status).toBe(warranty_claim_status.COMPLETED);
  });

  it.each([
    warranty_claim_status.COMPLETED,
    warranty_claim_status.REJECTED,
    warranty_claim_status.CANCELLED,
  ])('rejects direct completion from terminal status %s', async (status) => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      status,
    });
    const useCase = new CompleteWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(useCase.execute('claim-id', {})).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('throws not found when claim does not exist', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue(null);
    const useCase = new CompleteWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(useCase.execute('missing-id', {})).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
