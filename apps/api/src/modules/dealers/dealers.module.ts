import { PrismaModule } from '@/database/prisma/prisma.module';
import { DealersController } from '@/modules/dealers/dealers.controller';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { CreateDealerUseCase } from '@/modules/dealers/use-cases/create-dealer.use-case';
import { DownloadDealerImportTemplateUseCase } from '@/modules/dealers/use-cases/download-dealer-import-template.use-case';
import { ExportDealersUseCase } from '@/modules/dealers/use-cases/export-dealers.use-case';
import { GetDealerDetailUseCase } from '@/modules/dealers/use-cases/get-dealer-detail.use-case';
import { GenerateDealerCodeUseCase } from '@/modules/dealers/use-cases/generate-dealer-code.use-case';
import { ImportDealersUseCase } from '@/modules/dealers/use-cases/import-dealers.use-case';
import { ListDealerProvincesUseCase } from '@/modules/dealers/use-cases/list-dealer-provinces.use-case';
import { ListDealersUseCase } from '@/modules/dealers/use-cases/list-dealers.use-case';
import { ListDealerActivatedCustomersUseCase } from '@/modules/dealers/use-cases/list-dealer-activated-customers.use-case';
import { UpdateDealerUseCase } from '@/modules/dealers/use-cases/update-dealer.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [DealersController],
  providers: [
    DealersRepository,
    GenerateDealerCodeUseCase,
    CreateDealerUseCase,
    ListDealersUseCase,
    ListDealerActivatedCustomersUseCase,
    GetDealerDetailUseCase,
    UpdateDealerUseCase,
    ListDealerProvincesUseCase,
    DownloadDealerImportTemplateUseCase,
    ExportDealersUseCase,
    ImportDealersUseCase,
  ],
  exports: [DealersRepository, GenerateDealerCodeUseCase],
})
export class DealersModule {}
