import {
  buildWarrantyClaimListQuery,
  buildWarrantyClaimMetricsWhere,
  buildWarrantyClaimOverdueWhere,
} from '@/modules/warranty-claims/repository/warranty-claims.repository.queries';
import { warranty_claim_status } from '@prisma/client';

describe('warranty claim repository queries', () => {
  it('normalizes codes and builds search, date, service center and stable sort filters', () => {
    const { orderBy, where } = buildWarrantyClaimListQuery({
      search: '  lỗi màn hình  ',
      warrantyCode: ' wm-2026-001 ',
      claimCode: ' clm000001 ',
      serviceCenterId: 'service-center-id',
      dateFrom: '2026-07-01T00:00:00.000Z',
      dateTo: '2026-07-31T23:59:59.000Z',
      sortBy: 'dueAt',
      sortOrder: 'asc',
    });

    expect(where).toEqual(
      expect.objectContaining({
        warranty_code: 'WM-2026-001',
        claim_code: 'CLM000001',
        service_center_id: 'service-center-id',
        created_at: {
          gte: new Date('2026-07-01T00:00:00.000Z'),
          lte: new Date('2026-07-31T23:59:59.000Z'),
        },
      }),
    );
    expect(where.OR).toContainEqual({
      issue_title: {
        contains: 'lỗi màn hình',
        mode: 'insensitive',
      },
    });
    expect(orderBy).toEqual([
      { due_at: 'asc' },
      { created_at: 'desc' },
      { id: 'desc' },
    ]);
  });

  it('lists newest claims first with an id tie-breaker by default', () => {
    const { orderBy } = buildWarrantyClaimListQuery({});

    expect(orderBy).toEqual([{ created_at: 'desc' }, { id: 'desc' }]);
  });

  it('uses the current time and excludes terminal statuses for overdue claims', () => {
    const now = new Date('2026-07-24T08:00:00.000Z');
    const { where } = buildWarrantyClaimListQuery(
      {
        assignmentStatus: 'UNASSIGNED',
        isOverdue: 'true',
      },
      now,
    );

    expect(where).toEqual(
      expect.objectContaining({
        service_center_id: null,
        due_at: { lt: now },
        status: {
          notIn: [
            warranty_claim_status.COMPLETED,
            warranty_claim_status.REJECTED,
            warranty_claim_status.CANCELLED,
          ],
        },
      }),
    );
  });

  it('shares assignment and date scoping with metrics queries', () => {
    const where = buildWarrantyClaimMetricsWhere({
      assignmentStatus: 'ASSIGNED',
      dateFrom: '2026-07-01T00:00:00.000Z',
    });

    expect(where).toEqual({
      service_center_id: { not: null },
      created_at: {
        gte: new Date('2026-07-01T00:00:00.000Z'),
        lte: undefined,
      },
    });
  });

  it('adds overdue constraints without mutating the base metrics filter', () => {
    const now = new Date('2026-07-24T08:00:00.000Z');
    const baseWhere = { service_center_id: 'service-center-id' };

    expect(buildWarrantyClaimOverdueWhere(baseWhere, now)).toEqual({
      service_center_id: 'service-center-id',
      due_at: { lt: now },
      status: {
        notIn: [
          warranty_claim_status.COMPLETED,
          warranty_claim_status.REJECTED,
          warranty_claim_status.CANCELLED,
        ],
      },
    });
    expect(baseWhere).toEqual({ service_center_id: 'service-center-id' });
  });
});
