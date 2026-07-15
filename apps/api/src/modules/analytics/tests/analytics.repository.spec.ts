import { PrismaService } from '@/database/prisma/prisma.service';
import { AnalyticsRepository } from '@/modules/analytics/repository/analytics.repository';
import { Prisma } from '@prisma/client';

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
});
