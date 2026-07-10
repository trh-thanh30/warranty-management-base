import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { Injectable } from '@nestjs/common';

export interface IGenerateCustomerCodeUseCase {
  generateCustomerCodeBatch(count: number): Promise<string[]>;
  generateCustomerCode(): Promise<string>;
  execute(): Promise<string>;
}

@Injectable()
export class GenerateCustomerCodeUseCase implements IGenerateCustomerCodeUseCase {
  private readonly prefix = 'CUS';
  private readonly padLength = 6;

  constructor(private readonly customersRepository: CustomersRepository) {}

  async generateCustomerCodeBatch(count: number): Promise<string[]> {
    const lastCustomerCode =
      await this.customersRepository.findLastCustomerCode(this.prefix);
    const startNumber = this.getNextNumber(lastCustomerCode?.customer_code);

    const codes: string[] = [];
    for (let index = 0; index < count; index += 1) {
      codes.push(
        `${this.prefix}${(startNumber + index)
          .toString()
          .padStart(this.padLength, '0')}`,
      );
    }

    return codes;
  }

  async generateCustomerCode(): Promise<string> {
    const codes = await this.generateCustomerCodeBatch(1);
    return codes[0];
  }

  async execute(): Promise<string> {
    return this.generateCustomerCode();
  }

  private getNextNumber(lastCustomerCode?: string) {
    if (!lastCustomerCode) {
      return 1;
    }

    const match = lastCustomerCode.match(
      new RegExp(`^${this.prefix}(\\d{${this.padLength},})$`),
    );

    if (!match) {
      return 1;
    }

    return Number.parseInt(match[1], 10) + 1;
  }
}
