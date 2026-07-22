import { PrismaModule } from '@/database/prisma/prisma.module';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { ServiceCentersController } from '@/modules/service-centers/service-centers.controller';
import { CreateServiceCenterUseCase } from '@/modules/service-centers/use-cases/create-service-center.use-case';
import { DownloadServiceCenterImportTemplateUseCase } from '@/modules/service-centers/use-cases/download-service-center-import-template.use-case';
import { ExportServiceCentersUseCase } from '@/modules/service-centers/use-cases/export-service-centers.use-case';
import { GetServiceCenterDetailUseCase } from '@/modules/service-centers/use-cases/get-service-center-detail.use-case';
import { ImportServiceCentersUseCase } from '@/modules/service-centers/use-cases/import-service-centers.use-case';
import { ListServiceCenterProvincesUseCase } from '@/modules/service-centers/use-cases/list-service-center-provinces.use-case';
import { ListServiceCentersUseCase } from '@/modules/service-centers/use-cases/list-service-centers.use-case';
import { UpdateServiceCenterUseCase } from '@/modules/service-centers/use-cases/update-service-center.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceCentersController],
  providers: [
    ServiceCentersRepository,
    CreateServiceCenterUseCase,
    ListServiceCentersUseCase,
    ListServiceCenterProvincesUseCase,
    GetServiceCenterDetailUseCase,
    UpdateServiceCenterUseCase,
    DownloadServiceCenterImportTemplateUseCase,
    ExportServiceCentersUseCase,
    ImportServiceCentersUseCase,
  ],
  exports: [ServiceCentersRepository],
})
export class ServiceCentersModule {}
