import { BadRequestError } from '@/common/response';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { Injectable } from '@nestjs/common';

const MAX_SKU_LENGTH = 64;
const MAX_GENERATION_ATTEMPTS = 1_000;

@Injectable()
export class GenerateProductTemplateSkuUseCase {
  constructor(
    private readonly productTemplatesRepository: ProductTemplatesRepository,
  ) {}

  async execute(name: string) {
    const base = toSkuBase(name);

    for (let sequence = 1; sequence <= MAX_GENERATION_ATTEMPTS; sequence += 1) {
      const suffix = sequence === 1 ? '' : `-${sequence}`;
      const sku = `${base.slice(0, MAX_SKU_LENGTH - suffix.length)}${suffix}`;
      const existing = await this.productTemplatesRepository.findBySku(sku);
      if (!existing) return sku;
    }

    throw new BadRequestError(
      'Could not generate a unique product template SKU',
    );
  }
}

function toSkuBase(value: string) {
  return (
    value
      .trim()
      .toUpperCase()
      .replace(/Đ/g, 'D')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, MAX_SKU_LENGTH) || 'PRODUCT'
  );
}
