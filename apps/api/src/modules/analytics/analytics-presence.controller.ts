import { Permissions } from '@/common/decorators/permissions.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PresenceHeartbeatDto } from '@/modules/analytics/dto/presence-heartbeat.dto';
import { GetOnlinePresenceUseCase } from '@/modules/analytics/use-cases/get-online-presence.use-case';
import { RecordPresenceHeartbeatUseCase } from '@/modules/analytics/use-cases/record-presence-heartbeat.use-case';
import { Body, Controller, Get, Header, Post } from '@nestjs/common';
import { permission_key } from '@prisma/client';

@Controller('analytics/presence')
export class AnalyticsPresenceController {
  constructor(
    private readonly recordHeartbeat: RecordPresenceHeartbeatUseCase,
    private readonly getOnlinePresence: GetOnlinePresenceUseCase,
  ) {}

  @Public()
  @Post('web/heartbeat')
  webHeartbeat(@Body() body: PresenceHeartbeatDto) {
    return this.recordHeartbeat.execute('web', body.sessionId);
  }

  @Post('admin/heartbeat')
  adminHeartbeat(@User() user: { id: string }) {
    // Never trust a client-provided user identity or source for Admin counts.
    return this.recordHeartbeat.execute('admin', user.id);
  }

  @Get('online')
  @Header('Cache-Control', 'no-store')
  @Permissions([permission_key.DASHBOARD_VIEW])
  online() {
    return this.getOnlinePresence.execute();
  }
}
