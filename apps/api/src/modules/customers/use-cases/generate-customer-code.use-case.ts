import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface IGenerateCustomerCodeUseCase {
  generateCustomerCodeBatch(
    count: number,
    tx?: Prisma.TransactionClient,
  ): Promise<string[]>;
  generateCustomerCode(tx?: Prisma.TransactionClient): Promise<string>;
  execute(tx?: Prisma.TransactionClient): Promise<string>;
}

@Injectable()
export class GenerateCustomerCodeUseCase implements IGenerateCustomerCodeUseCase {
  private readonly prefix = 'CUS';
  private readonly padLength = 6;

  constructor(private readonly customersRepository: CustomersRepository) {}

  async generateCustomerCodeBatch(
    count: number,
    tx?: Prisma.TransactionClient,
  ): Promise<string[]> {
    const lastCustomerCode = tx
      ? await this.customersRepository.findLastCustomerCode(this.prefix, tx)
      : await this.customersRepository.findLastCustomerCode(this.prefix);
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

  async generateCustomerCode(tx?: Prisma.TransactionClient): Promise<string> {
    const codes = await this.generateCustomerCodeBatch(1, tx);
    return codes[0];
  }

  async execute(tx?: Prisma.TransactionClient): Promise<string> {
    return this.generateCustomerCode(tx);
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
