import { BadRequestError } from '@/common/response';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateCustomerCodeUseCase {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async execute() {
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
