import { ConflictError, NotFoundError } from '@/common/response';
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

    if (dto.phone) {
      const existingPhone = await this.customersRepository.findByPhone(
        dto.phone,
        id,
      );
      if (existingPhone) {
        throw new ConflictError('Customer phone already exists');
      }
    }

    if (dto.email) {
      const existingEmail = await this.customersRepository.findByEmail(
        dto.email,
        id,
      );
      if (existingEmail) {
        throw new ConflictError('Customer email already exists');
      }
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
