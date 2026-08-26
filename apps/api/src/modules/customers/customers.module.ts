import { PrismaModule } from '@/database/prisma/prisma.module';
import { CustomersController } from '@/modules/customers/customers.controller';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { CreateCustomerUseCase } from '@/modules/customers/use-cases/create-customer.use-case';
import { DownloadCustomerImportTemplateUseCase } from '@/modules/customers/use-cases/download-customer-import-template.use-case';
import { ExportCustomersUseCase } from '@/modules/customers/use-cases/export-customers.use-case';
import { GenerateCustomerCodeUseCase } from '@/modules/customers/use-cases/generate-customer-code.use-case';
import { GetCustomerDetailUseCase } from '@/modules/customers/use-cases/get-customer-detail.use-case';
import { ImportCustomersUseCase } from '@/modules/customers/use-cases/import-customers.use-case';
import { ListCustomersUseCase } from '@/modules/customers/use-cases/list-customers.use-case';
import { UpdateCustomerUseCase } from '@/modules/customers/use-cases/update-customer.use-case';
import { SoftDeleteCustomerUseCase } from '@/modules/customers/use-cases/soft-delete-customer.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController],
  providers: [
    CustomersRepository,
    CreateCustomerUseCase,
    DownloadCustomerImportTemplateUseCase,
    ExportCustomersUseCase,
    GenerateCustomerCodeUseCase,
    UpdateCustomerUseCase,
    ListCustomersUseCase,
    GetCustomerDetailUseCase,
    ImportCustomersUseCase,
    SoftDeleteCustomerUseCase,
  ],
  exports: [CustomersRepository, GenerateCustomerCodeUseCase],
})
export class CustomersModule {}
