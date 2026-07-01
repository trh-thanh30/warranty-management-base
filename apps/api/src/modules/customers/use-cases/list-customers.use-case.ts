import { toCustomerResponse } from '@/modules/customers/customers.types';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListCustomersUseCase {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async execute(search?: string) {
    const customers = await this.customersRepository.list(search);
    return customers.map(toCustomerResponse);
  }
}
