import { toCustomerResponse } from '@/modules/customers/customers.types';
import { ListCustomersDto } from '@/modules/customers/dto/list-customers.dto';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListCustomersUseCase {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async execute(query: ListCustomersDto) {
    const result = await this.customersRepository.list(query);

    return {
      items: result.items.map(toCustomerResponse),
      meta: result.meta,
    };
  }
}
