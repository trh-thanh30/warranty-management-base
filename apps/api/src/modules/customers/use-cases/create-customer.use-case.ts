import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { toCustomerResponse } from '@/modules/customers/customers.types';
import { CreateCustomerDto } from '@/modules/customers/dto/create-customer.dto';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(dto: CreateCustomerDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const existingCustomer = await this.customersRepository.findByUserId(
      dto.userId,
    );
    if (existingCustomer) {
      throw new ConflictError('User already has a customer profile');
    }

    const customerCode =
      dto.customerCode ?? (await this.generateCustomerCode());
    const existingCode =
      await this.customersRepository.findByCustomerCode(customerCode);
    if (existingCode) {
      throw new ConflictError('Customer code already exists');
    }

    const customer = await this.customersRepository.create({
      user: { connect: { id: dto.userId } },
      customer_code: customerCode,
      full_name: dto.fullName,
      phone: dto.phone ?? user.phone,
      email: dto.email ?? user.email,
      address: dto.address,
    });

    return toCustomerResponse(customer);
  }

  private async generateCustomerCode() {
    const year = new Date().getFullYear();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      const code = `CUS-${year}-${suffix}`;
      const existing = await this.customersRepository.findByCustomerCode(code);
      if (!existing) {
        return code;
      }
    }

    throw new BadRequestError('Could not generate a unique customer code');
  }
}
