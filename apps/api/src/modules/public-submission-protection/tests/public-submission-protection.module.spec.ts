import { RedisModule } from '@/database/redis/redis.module';
import { PublicSubmissionProtectionModule } from '@/modules/public-submission-protection/public-submission-protection.module';
import { PublicSubmissionQuotaService } from '@/modules/public-submission-protection/service/public-submission-quota.service';
import { TurnstileVerificationService } from '@/modules/public-submission-protection/service/turnstile-verification.service';
import { MODULE_METADATA } from '@nestjs/common/constants';

describe('PublicSubmissionProtectionModule', () => {
  it('owns and exports Turnstile verification and submission quotas', () => {
    const imports: unknown = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      PublicSubmissionProtectionModule,
    );
    const providers: unknown = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      PublicSubmissionProtectionModule,
    );
    const exports: unknown = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      PublicSubmissionProtectionModule,
    );

    expect(imports).toContain(RedisModule);
    expect(providers).toEqual(
      expect.arrayContaining([
        PublicSubmissionQuotaService,
        TurnstileVerificationService,
      ]),
    );
    expect(exports).toEqual(
      expect.arrayContaining([
        PublicSubmissionQuotaService,
        TurnstileVerificationService,
      ]),
    );
  });
});
