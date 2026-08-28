import { NotFoundError } from '@/common/response';
import { toCustomerResponse } from '@/modules/customers/customers.types';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SoftDeleteCustomerUseCase {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async execute(id: string) {
    const customer = await this.customersRepository.findById(id);
    if (!customer) throw new NotFoundError('Customer not found');
    if (customer.deleted_at) return toCustomerResponse(customer);
    const deletedCustomer = await this.customersRepository.update(id, {
      deleted_at: new Date(),
    });
    return toCustomerResponse(deletedCustomer);
  }
}
