import { Permissions } from '@/common/decorators/permissions.decorator';
import { CreateCustomerDto } from '@/modules/customers/dto/create-customer.dto';
import { ListCustomersDto } from '@/modules/customers/dto/list-customers.dto';
import { UpdateCustomerDto } from '@/modules/customers/dto/update-customer.dto';
import { CreateCustomerUseCase } from '@/modules/customers/use-cases/create-customer.use-case';
import { GetCustomerDetailUseCase } from '@/modules/customers/use-cases/get-customer-detail.use-case';
import { ListCustomersUseCase } from '@/modules/customers/use-cases/list-customers.use-case';
import { UpdateCustomerUseCase } from '@/modules/customers/use-cases/update-customer.use-case';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { permission_key } from '@prisma/client';

@Controller('customers')
export class CustomersController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly getCustomerDetailUseCase: GetCustomerDetailUseCase,
  ) {}

  @Get()
  @Permissions([permission_key.CUSTOMER_VIEW])
  list(@Query() query: ListCustomersDto) {
    return this.listCustomersUseCase.execute(query.search);
  }

  @Post()
  @Permissions([permission_key.CUSTOMER_CREATE])
  create(@Body() dto: CreateCustomerDto) {
    return this.createCustomerUseCase.execute(dto);
  }

  @Get(':id')
  @Permissions([permission_key.CUSTOMER_VIEW])
  detail(@Param('id') id: string) {
    return this.getCustomerDetailUseCase.execute(id);
  }

  @Patch(':id')
  @Permissions([permission_key.CUSTOMER_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.updateCustomerUseCase.execute(id, dto);
  }
}
