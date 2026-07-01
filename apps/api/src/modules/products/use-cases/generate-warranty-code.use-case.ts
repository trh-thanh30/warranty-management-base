import { BadRequestError } from '@/common/response';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';

const WARRANTY_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class GenerateWarrantyCodeUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(date = new Date()) {
    const year = date.getFullYear();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = Array.from({ length: 6 }, () =>
        WARRANTY_CODE_ALPHABET.charAt(
          Math.floor(Math.random() * WARRANTY_CODE_ALPHABET.length),
        ),
      ).join('');
      const code = `WM-${year}-${suffix}`;
      const existing = await this.productsRepository.findByWarrantyCode(code);

      if (!existing) {
        return code;
      }
    }

    throw new BadRequestError('Could not generate a unique warranty code');
  }
}
