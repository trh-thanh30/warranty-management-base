import { BadRequestError, NotFoundError } from '@/common/response';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Injectable } from '@nestjs/common';
import { product_status, type Customer, warranty_status } from '@prisma/client';
import type { CreateWarrantyActivationRequestItemBody } from '@repo/shared';

export type ValidatedActivationRequestItem = {
  activationFieldId: string | null;
  positionKey: string;
  positionLabel: string;
  productId: string;
  productName: string;
  productCode: string;
  serialNumber: string | null;
  warrantyId: string;
  warrantyCode: string;
  warrantyDurationMonths: number;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  currentOwner: Pick<Customer, 'email' | 'full_name' | 'phone'> | null;
};

@Injectable()
export class ActivationRequestItemsValidatorService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly requestsRepository: WarrantyActivationRequestsRepository,
  ) {}

  async validate(
    categoryId: string,
    items: CreateWarrantyActivationRequestItemBody[],
  ): Promise<ValidatedActivationRequestItem[]> {
    const category =
      await this.productsRepository.findActiveProductCategoryById(categoryId);
    if (!category) {
      throw new NotFoundError('Product category not found', 'NOT_FOUND', {
        code: 'PRODUCT_CATEGORY_NOT_FOUND',
        categoryId,
      });
    }

    const config =
      await this.categoriesRepository.getActivationFields(categoryId);
    if (!config) {
      throw new NotFoundError('Category not found', 'NOT_FOUND', {
        code: 'CATEGORY_NOT_FOUND',
      });
    }
    if (!config.activationFormEnabled) {
      this.throwValidation('ACTIVATION_FORM_DISABLED', { categoryId });
    }

    const productFields = config.activationFields.filter(
      (field) => field.type === 'PRODUCT_SELECT',
    );
    const fieldsByKey = new Map(
      productFields.map((field) => [field.key, field]),
    );
    const seenPositions = new Set<string>();
    const seenProducts = new Set<string>();

    for (const item of items) {
      if (seenPositions.has(item.positionKey)) {
        this.throwValidation('ACTIVATION_POSITION_DUPLICATE', {
          positionKey: item.positionKey,
        });
      }
      if (seenProducts.has(item.productId)) {
        this.throwValidation('ACTIVATION_PRODUCT_DUPLICATE', {
          productId: item.productId,
        });
      }
      seenPositions.add(item.positionKey);
      seenProducts.add(item.productId);
    }

    for (const field of productFields) {
      if (field.required && !seenPositions.has(field.key)) {
        this.throwValidation('ACTIVATION_REQUIRED_POSITION_MISSING', {
          positionKey: field.key,
        });
      }
    }

    const products =
      await this.productsRepository.findActivationRequestTargetsByIds([
        ...seenProducts,
      ]);
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    const openRequests = await this.requestsRepository.findOpenByProductIds([
      ...seenProducts,
    ]);
    const reservedProductIds = new Set(
      openRequests.flatMap((request) => [
        ...(request.product_id ? [request.product_id] : []),
        ...request.items.map((item) => item.product_id),
      ]),
    );

    return items.map((item) => {
      const field = fieldsByKey.get(item.positionKey);
      if (
        !field ||
        (item.activationFieldId && field.id !== item.activationFieldId)
      ) {
        this.throwValidation('ACTIVATION_POSITION_INVALID', {
          activationFieldId: item.activationFieldId,
          positionKey: item.positionKey,
        });
      }
      const product = productsById.get(item.productId);
      if (!product?.warranty) {
        throw new NotFoundError('Product warranty not found', 'NOT_FOUND', {
          code: 'PRODUCT_WARRANTY_NOT_FOUND',
          productId: item.productId,
        });
      }
      if (product.category_id !== categoryId) {
        this.throwValidation('PRODUCT_CATEGORY_MISMATCH', {
          categoryId,
          productCategoryId: product.category_id,
          productId: product.id,
        });
      }
      if (
        product.status !== product_status.ACTIVE ||
        product.warranty.status !== warranty_status.DRAFT ||
        !product.warranty.warranty_code
      ) {
        this.throwValidation('PRODUCT_NOT_ELIGIBLE_FOR_ACTIVATION_REQUEST', {
          productId: product.id,
        });
      }
      if (reservedProductIds.has(product.id)) {
        this.throwValidation('ACTIVATION_REQUEST_ALREADY_OPEN', {
          productId: product.id,
        });
      }

      return {
        activationFieldId: field.id ?? null,
        positionKey: field.key,
        positionLabel: field.label,
        productId: product.id,
        productName:
          product.display_name ?? product.template.name ?? product.product_code,
        productCode: product.product_code,
        serialNumber: product.serial_number,
        warrantyId: product.warranty.id,
        warrantyCode: product.warranty.warranty_code,
        warrantyDurationMonths: product.warranty.duration_months,
        brand: product.template.brand,
        model: product.template.model,
        manufactureYear: product.template.model_year,
        currentOwner: product.ownerships?.[0]?.customer ?? null,
      };
    });
  }

  private throwValidation(
    code: string,
    details: Record<string, unknown>,
  ): never {
    throw new BadRequestError(
      'Invalid activation request items',
      code,
      details,
    );
  }
}
