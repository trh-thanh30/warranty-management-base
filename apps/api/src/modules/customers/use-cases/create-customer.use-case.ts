import { ConflictError, NotFoundError } from '@/common/response';
import { toCustomerResponse } from '@/modules/customers/customers.types';
import { CreateCustomerDto } from '@/modules/customers/dto/create-customer.dto';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { GenerateCustomerCodeUseCase } from '@/modules/customers/use-cases/generate-customer-code.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly generateCustomerCodeUseCase: GenerateCustomerCodeUseCase,
  ) {}

  async execute(dto: CreateCustomerDto) {
    const user = dto.userId
      ? await this.customersRepository.findUserById(dto.userId)
      : null;

    if (dto.userId && !user) {
      throw new NotFoundError('User not found');
    }

    if (dto.userId) {
      const existingCustomer = await this.customersRepository.findByUserId(
        dto.userId,
      );
      if (existingCustomer) {
        throw new ConflictError('User already has a customer profile');
      }
    }

    const customerCode =
      dto.customerCode ?? (await this.generateCustomerCodeUseCase.execute());
    const existingCode =
      await this.customersRepository.findByCustomerCode(customerCode);
    if (existingCode) {
      throw new ConflictError('Customer code already exists');
    }

    const phone = dto.phone;
    const email = dto.email;

    const customer = await this.customersRepository.create({
      user: user ? { connect: { id: user.id } } : undefined,
      customer_code: customerCode,
      full_name: dto.fullName,
      phone,
      email,
      address: dto.address,
      birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
    });

    return toCustomerResponse(customer);
  }
}
