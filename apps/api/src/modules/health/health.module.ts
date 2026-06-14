import { PrismaModule } from '@/database/prisma/prisma.module';
import { HealthController } from '@/modules/health/health.controller';
import { HealthService } from '@/modules/health/health.service';
import { DatabaseHealthIndicator } from '@/modules/health/indicators/database.health';
import { SystemHealthIndicator } from '@/modules/health/indicators/system.health';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [HealthService, DatabaseHealthIndicator, SystemHealthIndicator],
  exports: [HealthService],
})
export class HealthModule {}
