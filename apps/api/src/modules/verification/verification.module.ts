import { RedisModule } from '@/database/redis/redis.module';
import { VerificationService } from '@/modules/verification/verification.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [RedisModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
