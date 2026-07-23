import { PrismaModule } from '@/database/prisma/prisma.module';
import { DealersController } from '@/modules/dealers/dealers.controller';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { CreateDealerUseCase } from '@/modules/dealers/use-cases/create-dealer.use-case';
import { GetDealerDetailUseCase } from '@/modules/dealers/use-cases/get-dealer-detail.use-case';
import { ListDealersUseCase } from '@/modules/dealers/use-cases/list-dealers.use-case';
import { UpdateDealerUseCase } from '@/modules/dealers/use-cases/update-dealer.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [DealersController],
  providers: [
    DealersRepository,
    CreateDealerUseCase,
    ListDealersUseCase,
    GetDealerDetailUseCase,
    UpdateDealerUseCase,
  ],
  exports: [DealersRepository],
})
export class DealersModule {}
