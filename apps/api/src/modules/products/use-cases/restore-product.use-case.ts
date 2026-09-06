import { NotFoundError } from '@/common/response';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';
import { product_status } from '@prisma/client';

@Injectable()
export class RestoreProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly activationCodeCryptoService?: ActivationCodeCryptoService,
  ) {}

  async execute(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    if (!product.deleted_at) return this.toResponse(product);

    const restoredProduct = await this.productsRepository.update(id, {
      deleted_at: null,
      status: product_status.ACTIVE,
    });
    return this.toResponse(restoredProduct);
  }

  private toResponse(product: Parameters<typeof toProductResponse>[0]) {
    return toProductResponse(
      product,
      undefined,
      this.activationCodeCryptoService
        ? (ciphertext) => this.activationCodeCryptoService!.decrypt(ciphertext)
        : undefined,
    );
  }
}
