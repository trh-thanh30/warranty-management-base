import { GetWarrantyClaimTimelineUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-timeline.use-case';
import { warranty_claim_status } from '@prisma/client';

describe('GetWarrantyClaimTimelineUseCase', () => {
  it('combines status and service-center events in chronological order', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue({
        id: 'claim-id',
        status_history: [
          {
            id: 'status-history-id',
            from_status: warranty_claim_status.SUBMITTED,
            to_status: warranty_claim_status.REVIEWING,
            note: 'Warranty eligibility verified',
            changed_by_user_id: 'admin-id',
            changed_by: {
              id: 'admin-id',
              username: 'admin',
              full_name: 'Admin User',
              email: 'admin@example.com',
            },
            created_at: new Date('2026-07-14T08:00:00.000Z'),
          },
        ],
        service_center_history: [
          {
            id: 'assignment-history-id',
            from_service_center_id: 'old-center-id',
            from_service_center_name: 'Da Nang Warranty Center',
            to_service_center_id: 'new-center-id',
            to_service_center_name: 'Hanoi Warranty Center',
            note: 'Old center lacks replacement parts',
            changed_by_user_id: 'admin-id',
            from_service_center: {
              id: 'old-center-id',
              name: 'Da Nang Warranty Center',
            },
            to_service_center: {
              id: 'new-center-id',
              name: 'Hanoi Warranty Center',
            },
            changed_by: {
              id: 'admin-id',
              username: 'admin',
              full_name: 'Admin User',
              email: 'admin@example.com',
            },
            created_at: new Date('2026-07-14T09:00:00.000Z'),
          },
        ],
      }),
    };
    const useCase = new GetWarrantyClaimTimelineUseCase(repository as never);

    const result = await useCase.execute('claim-id');

    expect(result).toEqual([
      expect.objectContaining({
        id: 'status-history-id',
        type: 'STATUS_CHANGED',
        fromStatus: warranty_claim_status.SUBMITTED,
        toStatus: warranty_claim_status.REVIEWING,
      }),
      expect.objectContaining({
        id: 'assignment-history-id',
        type: 'SERVICE_CENTER_CHANGED',
        fromServiceCenter: {
          id: 'old-center-id',
          name: 'Da Nang Warranty Center',
        },
        toServiceCenter: {
          id: 'new-center-id',
          name: 'Hanoi Warranty Center',
        },
        reason: 'Old center lacks replacement parts',
      }),
    ]);
  });
});
