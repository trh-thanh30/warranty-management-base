import { BadRequestError } from '@/common/response';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { Injectable } from '@nestjs/common';

const MAX_SLUG_LENGTH = 180;
const MAX_GENERATION_ATTEMPTS = 1_000;

@Injectable()
export class GenerateProductTemplateSlugUseCase {
  constructor(
    private readonly productTemplatesRepository: ProductTemplatesRepository,
  ) {}

  async execute(name: string) {
    const base = toSlugBase(name);

    for (let sequence = 1; sequence <= MAX_GENERATION_ATTEMPTS; sequence += 1) {
      const suffix = sequence === 1 ? '' : `-${sequence}`;
      const slug = `${base.slice(0, MAX_SLUG_LENGTH - suffix.length)}${suffix}`;
      const existing = await this.productTemplatesRepository.findBySlug(slug);
      if (!existing) return slug;
    }

    throw new BadRequestError(
      'Could not generate a unique product template slug',
    );
  }
}

function toSlugBase(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/đ/g, 'd')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, MAX_SLUG_LENGTH) || 'product'
  );
}
