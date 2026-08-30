import { PrismaModule } from '@/database/prisma/prisma.module';
import { ActivationCodesController } from '@/modules/activation-codes/activation-codes.controller';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { CreateActivationCodeBatchUseCase } from '@/modules/activation-codes/use-cases/create-activation-code-batch.use-case';
import { GenerateActivationCodeUseCase } from '@/modules/activation-codes/use-cases/generate-activation-code.use-case';
import { SystemConfigModule } from '@/modules/system-config/system-config.module';
import { ProductsModule } from '@/modules/products/products.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, ProductsModule, SystemConfigModule],
  controllers: [ActivationCodesController],
  providers: [
    ActivationCodeBatchesRepository,
    ActivationCodeCryptoService,
    GenerateActivationCodeUseCase,
    CreateActivationCodeBatchUseCase,
  ],
})
export class ActivationCodesModule {}
