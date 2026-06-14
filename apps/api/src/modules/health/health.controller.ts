import { ApiSuccess } from '@/common/decorators';
import { Public } from '@/common/decorators/public.decorator';
import { HealthService } from '@/modules/health/health.service';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheck } from '@nestjs/terminus';
import * as Sentry from '@sentry/nestjs';

@Public()
@Controller('health')
export class HealthController {
  private isProduction: boolean;
  private healthEndpointsEnabled: boolean;

  constructor(
    private configService: ConfigService,
    private healthService: HealthService,
  ) {
    // Check if we're in production environment
    this.isProduction = this.configService.get('NODE_ENV') === 'production';

    // Check if detailed health endpoints are enabled (default: false in production)
    const healthEndpointsEnabled = this.configService.get<boolean | string>(
      'HEALTH_ENDPOINTS_ENABLED',
      false,
    );
    this.healthEndpointsEnabled =
      healthEndpointsEnabled === true || healthEndpointsEnabled === 'true';
  }

  /**
   * Check if health endpoints are allowed to be accessed
   */

  private isHealthEndpointAllowed(): boolean {
    // Always allow in development
    if (!this.isProduction) return true;

    // In production, only allow if explicitly enabled
    return this.healthEndpointsEnabled;
  }

  /**
   * Basic liveness check - checks if the application is running
   */
  @Get('live')
  @ApiSuccess('Application is alive')
  @HealthCheck()
  async liveness() {
    return this.healthService.liveness();
  }

  /**
   * Comprehensive health check - checks database and system
   * Only available when HEALTH_ENDPOINTS_ENABLED=true or in development
   */
  @Get()
  @ApiSuccess('Application is healthy')
  @HealthCheck()
  async health() {
    if (!this.isHealthEndpointAllowed()) {
      throw new Error('Health endpoint not available in production');
    }

    return this.healthService.check();
  }

  @Get('debug-sentry')
  async debugSentry() {
    if (!this.isHealthEndpointAllowed()) {
      return {
        status: 'disabled',
        message:
          'Sentry debug endpoint is disabled in production. Set HEALTH_ENDPOINTS_ENABLED=true to enable it.',
      };
    }

    const error = new Error('My first Sentry error!');
    const eventId = Sentry.captureException(error);
    const flushed = await Sentry.flush(3000);

    return {
      status: flushed ? 'sent' : 'queued_or_failed',
      eventId,
      dsnConfigured: Boolean(process.env.SENTRY_DSN),
      sentryProjectId: this.getSentryProjectId(),
      environment: process.env.NODE_ENV || 'development',
      message:
        'Sentry test event captured. Check the Sentry project that matches the active SENTRY_DSN and environment.',
    };
  }

  private getSentryProjectId() {
    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {
      return null;
    }

    return dsn.split('/').filter(Boolean).at(-1) ?? null;
  }
}
