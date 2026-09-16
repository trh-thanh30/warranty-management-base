import { RedisModule } from '@/database/redis/redis.module';
import { PublicSubmissionQuotaService } from '@/modules/public-submission-protection/service/public-submission-quota.service';
import { TurnstileVerificationService } from '@/modules/public-submission-protection/service/turnstile-verification.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [RedisModule],
  providers: [PublicSubmissionQuotaService, TurnstileVerificationService],
  exports: [PublicSubmissionQuotaService, TurnstileVerificationService],
})
export class PublicSubmissionProtectionModule {}
