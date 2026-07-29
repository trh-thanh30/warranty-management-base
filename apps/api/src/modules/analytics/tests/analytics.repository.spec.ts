import { PrismaService } from '@/database/prisma/prisma.service';
import { AnalyticsRepository } from '@/modules/analytics/repository/analytics.repository';
import {
  Prisma,
  warranty_activation_request_source,
  warranty_activation_request_status,
} from '@prisma/client';

describe('AnalyticsRepository', () => {
  it.each(['day', 'week', 'month'] as const)(
    'quotes the %s date_trunc interval as a controlled SQL literal',
    async (interval) => {
      const queryRaw = jest.fn().mockResolvedValue([
        {
          bucket: new Date('2026-07-15T00:00:00.000Z'),
          value: 1n,
        },
      ]);

      const prismaService = {
        $queryRaw: queryRaw,
      } as unknown as PrismaService;
      const repository = new AnalyticsRepository(prismaService);

      await repository.getTrends({
        interval,
        metric: 'claims',
        range: {
          from: new Date('2026-07-01T00:00:00.000Z'),
          to: new Date('2026-07-31T23:59:59.999Z'),
        },
      });

      const [strings, ...values] = queryRaw.mock.calls[0] as [
        TemplateStringsArray,
        ...unknown[],
      ];
      const query = Prisma.sql(strings, ...values);
      expect(query.sql).toContain(`date_trunc('${interval}', created_at)`);
    },
  );

  it('filters activation request status and source metrics by the selected range', async () => {
    const range = {
      from: new Date('2026-07-19T00:00:00.000Z'),
      to: new Date('2026-07-25T23:59:59.999Z'),
    };
    const count = jest.fn();
    const groupBy = jest.fn();
    const transaction = jest.fn().mockResolvedValue([
      12,
      12,
      [
        {
          status: warranty_activation_request_status.PENDING,
          _count: { _all: 5 },
        },
      ],
      [
        {
          source: warranty_activation_request_source.PUBLIC_WEB,
          _count: { _all: 7 },
        },
      ],
    ]);

    const prismaService = {
      $transaction: transaction,
      warrantyActivationRequest: {
        count,
        groupBy,
      },
    } as unknown as PrismaService;
    const repository = new AnalyticsRepository(prismaService);

    await repository.getActivationRequests({ range });

    const expectedWhere = { created_at: { gte: range.from, lte: range.to } };
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
    expect(groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['status'],
        where: expectedWhere,
      }),
    );
    expect(groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['source'],
        where: expectedWhere,
      }),
    );
  });
});
