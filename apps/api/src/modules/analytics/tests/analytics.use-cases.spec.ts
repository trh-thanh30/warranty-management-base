import { AnalyticsRepository } from '@/modules/analytics/repository/analytics.repository';
import { GetDashboardClaimsUseCase } from '@/modules/analytics/use-cases/get-dashboard-claims.use-case';
import { GetDashboardOverviewUseCase } from '@/modules/analytics/use-cases/get-dashboard-overview.use-case';
import { GetDashboardProductsUseCase } from '@/modules/analytics/use-cases/get-dashboard-products.use-case';
import { GetDashboardTrendsUseCase } from '@/modules/analytics/use-cases/get-dashboard-trends.use-case';
import { GetDashboardWarrantiesUseCase } from '@/modules/analytics/use-cases/get-dashboard-warranties.use-case';
import { GetRecentActivityUseCase } from '@/modules/analytics/use-cases/get-recent-activity.use-case';

type AnalyticsRepositoryMock = {
  getOverview: jest.Mock;
  getClaims: jest.Mock;
  getTrends: jest.Mock;
  getWarranties: jest.Mock;
  getProducts: jest.Mock;
  getRecentActivity: jest.Mock;
};

type AnalyticsDateRangeServiceMock = {
  resolveAnalyticsRange: jest.Mock;
  resolvePreviousRange: jest.Mock;
};

describe('Analytics use cases', () => {
  const range = {
    from: new Date('2026-07-01T00:00:00.000Z'),
    to: new Date('2026-07-31T23:59:59.999Z'),
  };
  const previousRange = {
    from: new Date('2026-05-31T00:00:00.000Z'),
    to: new Date('2026-06-30T23:59:59.999Z'),
  };

  const createAnalyticsRepository = () =>
    ({
      getOverview: jest.fn(),
      getClaims: jest.fn(),
      getTrends: jest.fn(),
      getWarranties: jest.fn(),
      getProducts: jest.fn(),
      getRecentActivity: jest.fn(),
    }) satisfies AnalyticsRepositoryMock;

  const createDateRangeService = () =>
    ({
      resolveAnalyticsRange: jest.fn().mockReturnValue(range),
      resolvePreviousRange: jest.fn().mockReturnValue(previousRange),
    }) satisfies AnalyticsDateRangeServiceMock;

  it('builds the dashboard overview response from repository metrics', async () => {
    const analyticsRepository = createAnalyticsRepository();
    const dateRangeService = createDateRangeService();
    analyticsRepository.getOverview.mockResolvedValue({
      customers: 10,
      products: 20,
      activeWarranties: 12,
      expiredWarranties: 3,
      openClaims: 4,
      overdueClaims: 2,
      completedClaims: 6,
      serviceCenters: 5,
      deltas: {
        customers: 1,
        products: 2,
        claims: -1,
        completedClaims: 3,
      },
    });
    const useCase = new GetDashboardOverviewUseCase(
      analyticsRepository as unknown as AnalyticsRepository,
      dateRangeService,
    );

    const result = await useCase.execute({
      from: '2026-07-01',
      to: '2026-07-31',
      serviceCenterId: '11111111-1111-1111-1111-111111111111',
    });

    expect(dateRangeService.resolveAnalyticsRange).toHaveBeenCalledWith({
      from: '2026-07-01',
      to: '2026-07-31',
      serviceCenterId: '11111111-1111-1111-1111-111111111111',
    });
    expect(dateRangeService.resolvePreviousRange).toHaveBeenCalledWith(range);
    expect(analyticsRepository.getOverview).toHaveBeenCalledWith({
      range,
      previousRange,
      serviceCenterId: '11111111-1111-1111-1111-111111111111',
    });
    expect(result).toEqual({
      range: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-31T23:59:59.999Z',
      },
      totals: {
        customers: 10,
        products: 20,
        activeWarranties: 12,
        expiredWarranties: 3,
        openClaims: 4,
        overdueClaims: 2,
        completedClaims: 6,
        serviceCenters: 5,
      },
      deltas: {
        customers: 1,
        products: 2,
        claims: -1,
        completedClaims: 3,
      },
    });
  });

  it('loads dashboard claim metrics for the resolved range', async () => {
    const analyticsRepository = createAnalyticsRepository();
    const dateRangeService = createDateRangeService();
    const metrics = {
      total: 7,
      createdToday: 1,
      createdThisMonth: 7,
      overdue: 2,
      averageResolutionHours: 12,
      byStatus: [{ status: 'SUBMITTED' as const, count: 3 }],
      byPriority: [{ priority: 'HIGH' as const, count: 2 }],
      byServiceCenter: [
        {
          serviceCenterId: 'service-center-id',
          serviceCenterName: 'Ha Noi Center',
          count: 4,
        },
      ],
    };
    analyticsRepository.getClaims.mockResolvedValue(metrics);
    const useCase = new GetDashboardClaimsUseCase(
      analyticsRepository as unknown as AnalyticsRepository,
      dateRangeService,
    );

    const result = await useCase.execute({
      serviceCenterId: 'service-center-id',
    });

    expect(analyticsRepository.getClaims).toHaveBeenCalledWith({
      range,
      serviceCenterId: 'service-center-id',
    });
    expect(result).toBe(metrics);
  });

  it('defaults dashboard trends to claims by day', async () => {
    const analyticsRepository = createAnalyticsRepository();
    const dateRangeService = createDateRangeService();
    analyticsRepository.getTrends.mockResolvedValue([
      { date: '2026-07-01T00:00:00.000Z', value: 4 },
    ]);
    const useCase = new GetDashboardTrendsUseCase(
      analyticsRepository as unknown as AnalyticsRepository,
      dateRangeService,
    );

    const result = await useCase.execute({});

    expect(analyticsRepository.getTrends).toHaveBeenCalledWith({
      metric: 'claims',
      interval: 'day',
      range,
      serviceCenterId: undefined,
    });
    expect(result).toEqual({
      metric: 'claims',
      interval: 'day',
      points: [{ date: '2026-07-01T00:00:00.000Z', value: 4 }],
    });
  });

  it('passes custom trend metric and interval to the repository', async () => {
    const analyticsRepository = createAnalyticsRepository();
    const dateRangeService = createDateRangeService();
    analyticsRepository.getTrends.mockResolvedValue([]);
    const useCase = new GetDashboardTrendsUseCase(
      analyticsRepository as unknown as AnalyticsRepository,
      dateRangeService,
    );

    await useCase.execute({
      metric: 'claim_completed',
      interval: 'month',
      serviceCenterId: 'service-center-id',
    });

    expect(analyticsRepository.getTrends).toHaveBeenCalledWith({
      metric: 'claim_completed',
      interval: 'month',
      range,
      serviceCenterId: 'service-center-id',
    });
  });

  it('loads warranty analytics for the resolved range', async () => {
    const analyticsRepository = createAnalyticsRepository();
    const dateRangeService = createDateRangeService();
    const warranties = {
      total: 9,
      byStatus: [{ status: 'ACTIVE' as const, count: 6 }],
      expiringSoon: {
        next7Days: 1,
        next30Days: 2,
        next90Days: 3,
      },
      activatedInRange: 4,
    };
    analyticsRepository.getWarranties.mockResolvedValue(warranties);
    const useCase = new GetDashboardWarrantiesUseCase(
      analyticsRepository as unknown as AnalyticsRepository,
      dateRangeService,
    );

    const result = await useCase.execute({ from: '2026-07-01' });

    expect(analyticsRepository.getWarranties).toHaveBeenCalledWith({ range });
    expect(result).toBe(warranties);
  });

  it('loads product analytics without date filtering', async () => {
    const analyticsRepository = createAnalyticsRepository();
    const products = {
      total: 5,
      byStatus: [{ status: 'ACTIVE' as const, count: 5 }],
      byCategory: [{ categoryId: null, categoryName: null, count: 2 }],
      topBrands: [{ brand: 'Toyota', count: 3 }],
    };
    analyticsRepository.getProducts.mockResolvedValue(products);
    const useCase = new GetDashboardProductsUseCase(
      analyticsRepository as unknown as AnalyticsRepository,
    );

    const result = await useCase.execute();

    expect(analyticsRepository.getProducts).toHaveBeenCalledWith();
    expect(result).toBe(products);
  });

  it('serializes recent activity timestamps for API clients', async () => {
    const analyticsRepository = createAnalyticsRepository();
    analyticsRepository.getRecentActivity.mockResolvedValue([
      {
        id: 'claim-created-1',
        type: 'CLAIM_CREATED',
        title: 'Claim CLM-1 created',
        description: 'Screen issue',
        occurredAt: new Date('2026-07-15T10:00:00.000Z'),
        entity: {
          type: 'warranty_claim',
          id: 'claim-id',
          code: 'CLM-1',
        },
      },
    ]);
    const useCase = new GetRecentActivityUseCase(
      analyticsRepository as unknown as AnalyticsRepository,
    );

    const result = await useCase.execute({ limit: 5 });

    expect(analyticsRepository.getRecentActivity).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      items: [
        {
          id: 'claim-created-1',
          type: 'CLAIM_CREATED',
          title: 'Claim CLM-1 created',
          description: 'Screen issue',
          occurredAt: '2026-07-15T10:00:00.000Z',
          entity: {
            type: 'warranty_claim',
            id: 'claim-id',
            code: 'CLM-1',
          },
        },
      ],
    });
  });
});
