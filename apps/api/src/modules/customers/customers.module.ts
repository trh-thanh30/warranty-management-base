import { PrismaModule } from '@/database/prisma/prisma.module';
import { CustomersController } from '@/modules/customers/customers.controller';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { CreateCustomerUseCase } from '@/modules/customers/use-cases/create-customer.use-case';
import { GenerateCustomerCodeUseCase } from '@/modules/customers/use-cases/generate-customer-code.use-case';
import { GetCustomerDetailUseCase } from '@/modules/customers/use-cases/get-customer-detail.use-case';
import { ListCustomersUseCase } from '@/modules/customers/use-cases/list-customers.use-case';
import { UpdateCustomerUseCase } from '@/modules/customers/use-cases/update-customer.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController],
  providers: [
    CustomersRepository,
    CreateCustomerUseCase,
    GenerateCustomerCodeUseCase,
    UpdateCustomerUseCase,
    ListCustomersUseCase,
    GetCustomerDetailUseCase,
  ],
  exports: [CustomersRepository],
})
export class CustomersModule {}
