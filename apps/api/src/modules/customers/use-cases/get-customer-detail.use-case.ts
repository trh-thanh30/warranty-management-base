import { NotFoundError } from '@/common/response';
import { toCustomerResponse } from '@/modules/customers/customers.types';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetCustomerDetailUseCase {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async execute(id: string) {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return toCustomerResponse(customer);
  }
}
