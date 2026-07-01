import { ConflictError, NotFoundError } from '@/common/response';
import { UpdateProductDto } from '@/modules/products/dto/update-product.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: string, dto: UpdateProductDto) {
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct || existingProduct.deleted_at) {
      throw new NotFoundError('Product not found');
    }

    if (
      dto.serialNumber &&
      dto.serialNumber !== existingProduct.serial_number
    ) {
      const productWithSerial =
        await this.productsRepository.findBySerialNumber(dto.serialNumber);
      if (productWithSerial && productWithSerial.id !== id) {
        throw new ConflictError('Serial number already exists');
      }
    }

    const product = await this.productsRepository.update(id, {
      name: dto.name,
      category: dto.category,
      brand: dto.brand,
      model: dto.model,
      manufacture_year: dto.manufactureYear,
      description: dto.description,
      status: dto.status,
      serial_number: dto.serialNumber,
    });

    return toProductResponse(product);
  }
}
