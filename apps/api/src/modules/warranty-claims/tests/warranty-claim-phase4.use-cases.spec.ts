import { BadRequestError, NotFoundError } from '@/common/response';
import { WarrantyClaimSlaService } from '@/modules/warranty-claims/service/warranty-claim-sla.service';
import { GetWarrantyClaimMetricsUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-metrics.use-case';
import { UpdateWarrantyClaimPriorityUseCase } from '@/modules/warranty-claims/use-cases/update-warranty-claim-priority.use-case';
import { warranty_claim_priority, warranty_claim_status } from '@prisma/client';

describe('Warranty claim phase 4 use cases', () => {
  const warrantyClaimsRepository = {
    findById: jest.fn(),
    updatePriority: jest.fn(),
    getMetrics: jest.fn(),
  };
  const slaService = new WarrantyClaimSlaService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates due date by priority', () => {
    const baseDate = new Date('2026-07-03T00:00:00.000Z');

    expect(
      slaService.calculateDueAt(warranty_claim_priority.NORMAL, baseDate),
    ).toEqual(new Date('2026-07-06T00:00:00.000Z'));
    expect(
      slaService.calculateDueAt(warranty_claim_priority.HIGH, baseDate),
    ).toEqual(new Date('2026-07-04T00:00:00.000Z'));
  });

  it('updates priority and recalculates due date', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      status: warranty_claim_status.REVIEWING,
      priority: warranty_claim_priority.NORMAL,
      due_at: new Date('2026-07-06T00:00:00.000Z'),
      sla_breached_at: null,
    });
    warrantyClaimsRepository.updatePriority.mockResolvedValue({
      id: 'claim-id',
      claim_code: 'CLM000001',
      warranty_id: 'warranty-id',
      product_id: 'product-id',
      customer_id: null,
      service_center_id: null,
      warranty_code: 'WM-2026-ABCDEF',
      requester_name: null,
      requester_phone: null,
      issue_title: 'May khong hoat dong',
      issue_detail: null,
      status: warranty_claim_status.REVIEWING,
      priority: warranty_claim_priority.HIGH,
      due_at: new Date('2026-07-04T00:00:00.000Z'),
      sla_breached_at: null,
      submitted_at: new Date('2026-07-03T00:00:00.000Z'),
      resolved_at: null,
      created_at: new Date('2026-07-03T00:00:00.000Z'),
      updated_at: new Date('2026-07-03T00:00:00.000Z'),
    });
    const useCase = new UpdateWarrantyClaimPriorityUseCase(
      warrantyClaimsRepository as never,
      slaService,
    );

    const result = await useCase.execute('claim-id', {
      priority: warranty_claim_priority.HIGH,
    });

    expect(warrantyClaimsRepository.updatePriority).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'claim-id',
        priority: warranty_claim_priority.HIGH,
        dueAt: expect.any(Date),
      }),
    );
    expect(result.priority).toBe(warranty_claim_priority.HIGH);
  });

  it('rejects empty priority updates', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({
      id: 'claim-id',
      status: warranty_claim_status.REVIEWING,
      priority: warranty_claim_priority.NORMAL,
      due_at: null,
      sla_breached_at: null,
    });
    const useCase = new UpdateWarrantyClaimPriorityUseCase(
      warrantyClaimsRepository as never,
      slaService,
    );

    await expect(useCase.execute('claim-id', {})).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('throws not found when updating missing claim priority', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue(null);
    const useCase = new UpdateWarrantyClaimPriorityUseCase(
      warrantyClaimsRepository as never,
      slaService,
    );

    await expect(
      useCase.execute('missing-id', {
        priority: warranty_claim_priority.HIGH,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('maps metrics repository result for dashboard', async () => {
    warrantyClaimsRepository.getMetrics.mockResolvedValue({
      total: 5,
      createdToday: 1,
      createdThisMonth: 4,
      overdue: 2,
      averageResolutionHours: 12,
      byStatus: [
        {
          status: warranty_claim_status.SUBMITTED,
          _count: { _all: 2 },
        },
      ],
      byPriority: [
        {
          priority: warranty_claim_priority.HIGH,
          _count: { _all: 1 },
        },
      ],
      byServiceCenter: [
        {
          service_center_id: 'service-center-id',
          _count: { _all: 3 },
        },
      ],
    });
    const useCase = new GetWarrantyClaimMetricsUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(useCase.execute({})).resolves.toMatchObject({
      total: 5,
      overdue: 2,
      byStatus: [{ status: warranty_claim_status.SUBMITTED, count: 2 }],
      byPriority: [{ priority: warranty_claim_priority.HIGH, count: 1 }],
      byServiceCenter: [{ serviceCenterId: 'service-center-id', count: 3 }],
    });
  });
});
