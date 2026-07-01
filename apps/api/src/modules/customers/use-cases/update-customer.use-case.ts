import { NotFoundError } from '@/common/response';
import { toCustomerResponse } from '@/modules/customers/customers.types';
import { UpdateCustomerDto } from '@/modules/customers/dto/update-customer.dto';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async execute(id: string, dto: UpdateCustomerDto) {
    const existingCustomer = await this.customersRepository.findById(id);
    if (!existingCustomer) {
      throw new NotFoundError('Customer not found');
    }

    const customer = await this.customersRepository.update(id, {
      full_name: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
    });

    return toCustomerResponse(customer);
  }
}
