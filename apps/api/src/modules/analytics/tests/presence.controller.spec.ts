import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { AnalyticsPresenceController } from '@/modules/analytics/analytics-presence.controller';
import { AnalyticsModule } from '@/modules/analytics/analytics.module';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { PresenceRepository } from '@/modules/analytics/repository/presence.repository';
import { GetOnlinePresenceUseCase } from '@/modules/analytics/use-cases/get-online-presence.use-case';
import { RecordPresenceHeartbeatUseCase } from '@/modules/analytics/use-cases/record-presence-heartbeat.use-case';
import { permission_key } from '@prisma/client';

describe('AnalyticsPresenceController', () => {
  it('registers presence inside the existing AnalyticsModule', () => {
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AnalyticsModule),
    ).toContain(AnalyticsPresenceController);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AnalyticsModule),
    ).toEqual(
      expect.arrayContaining([
        PresenceRepository,
        GetOnlinePresenceUseCase,
        RecordPresenceHeartbeatUseCase,
      ]),
    );
  });
  it('allows only Web heartbeats without authentication and protects counts', () => {
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        AnalyticsPresenceController.prototype.webHeartbeat,
      ),
    ).toBe(true);
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        AnalyticsPresenceController.prototype.adminHeartbeat,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        Permissions.KEY,
        AnalyticsPresenceController.prototype.online,
      ),
    ).toEqual([permission_key.DASHBOARD_VIEW]);
  });

  it('takes the Admin identity from the authenticated user', async () => {
    const repository = { heartbeat: jest.fn() };
    const controller = new AnalyticsPresenceController(
      new RecordPresenceHeartbeatUseCase(repository),
      new GetOnlinePresenceUseCase({ getOnlineCounts: jest.fn() }),
    );
    await controller.adminHeartbeat({ id: 'authenticated-user' });
    expect(repository.heartbeat).toHaveBeenCalledWith(
      'admin',
      'authenticated-user',
    );
  });
});
