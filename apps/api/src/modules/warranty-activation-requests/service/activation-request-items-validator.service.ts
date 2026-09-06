import { BadRequestError, NotFoundError } from '@/common/response';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import {
  getProductCatalogue,
  getProductDisplayName,
} from '@/modules/products/product-catalogue';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Injectable } from '@nestjs/common';
import {
  activation_code_status,
  product_status,
  type Customer,
  warranty_status,
} from '@prisma/client';
import type { CreateWarrantyActivationRequestItemBody } from '@repo/shared';

export type ValidatedActivationRequestItem = {
  activationCodeId: string | null;
  activationFieldId: string | null;
  positionKey: string;
  positionLabel: string;
  productId: string;
  productName: string;
  productCode: string;
  serialNumber: string | null;
  warrantyId: string | null;
  warrantyCode: string | null;
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
    private readonly activationCodesRepository: ActivationCodeBatchesRepository,
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
    if (
      category.activation_code_enabled === false &&
      items.some((item) => item.activationCodeId)
    ) {
      this.throwValidation('ACTIVATION_CODE_NOT_APPLICABLE', { categoryId });
    }
    const requiresActivationCode = category.activation_code_enabled !== false;

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
    const seenCodes = new Set<string>();
    const genericMode =
      items.length > 0 && items.every((item) => Boolean(item.activationCodeId));
    if (!genericMode && items.some((item) => item.activationCodeId)) {
      this.throwValidation('ACTIVATION_ITEM_MIXED_MODE', {});
    }

    for (const item of items) {
      if (seenPositions.has(item.positionKey)) {
        this.throwValidation('ACTIVATION_POSITION_DUPLICATE', {
          positionKey: item.positionKey,
        });
      }
      if (seenProducts.has(item.productId)) {
        if (!item.activationCodeId) {
          this.throwValidation('ACTIVATION_PRODUCT_DUPLICATE', {
            productId: item.productId,
          });
        }
      }
      if (item.activationCodeId && seenCodes.has(item.activationCodeId)) {
        this.throwValidation('ACTIVATION_CODE_DUPLICATE', {
          activationCodeId: item.activationCodeId,
        });
      }
      seenPositions.add(item.positionKey);
      seenProducts.add(item.productId);
      if (item.activationCodeId) seenCodes.add(item.activationCodeId);
    }

    for (const field of productFields) {
      if (genericMode) break;
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

    const codeRecords = new Map(
      (
        await Promise.all(
          items
            .filter((item) => item.activationCodeId)
            .map(async (item) => {
              const code = await this.activationCodesRepository.findById(
                item.activationCodeId!,
              );
              return [item.activationCodeId!, code] as const;
            }),
        )
      ).filter((entry): entry is [string, NonNullable<(typeof entry)[1]>] =>
        Boolean(entry[1]),
      ),
    );

    for (const item of items) {
      if (item.activationCodeId) {
        const code = codeRecords.get(item.activationCodeId);
        if (!code) {
          this.throwValidation('ACTIVATION_CODE_INVALID_OR_EXPIRED', {
            activationCodeId: item.activationCodeId,
          });
        }
        if (code.status === activation_code_status.PENDING_APPROVAL) {
          this.throwValidation('ACTIVATION_REQUEST_ALREADY_OPEN', {
            activationCodeId: item.activationCodeId,
          });
        }
        if (code.status !== activation_code_status.AVAILABLE) {
          this.throwValidation('ACTIVATION_CODE_INVALID_OR_EXPIRED', {
            activationCodeId: item.activationCodeId,
          });
        }
        if (code.expires_at <= new Date()) {
          await this.activationCodesRepository.expireIfNeeded(code.id);
          this.throwValidation('ACTIVATION_CODE_INVALID_OR_EXPIRED', {
            activationCodeId: item.activationCodeId,
          });
        }
        if (!code.product_id) {
          this.throwValidation('ACTIVATION_CODE_PRODUCT_NOT_ASSIGNED', {
            activationCodeId: item.activationCodeId,
          });
        }
        if (code.product_id !== item.productId) {
          this.throwValidation('ACTIVATION_CODE_PRODUCT_MISMATCH', {
            activationCodeId: item.activationCodeId,
            assignedProductId: code.product_id,
            productId: item.productId,
          });
        }
      }
    }

    return items.map((item) => {
      const field = fieldsByKey.get(item.positionKey);
      if (
        !genericMode &&
        (!field ||
          (item.activationFieldId && field.id !== item.activationFieldId))
      ) {
        this.throwValidation('ACTIVATION_POSITION_INVALID', {
          activationFieldId: item.activationFieldId,
          positionKey: item.positionKey,
        });
      }
      const product = productsById.get(item.productId);
      if (!product) {
        throw new NotFoundError('Product not found', 'NOT_FOUND', {
          code: 'PRODUCT_NOT_FOUND',
          productId: item.productId,
        });
      }
      if (
        requiresActivationCode &&
        !item.activationCodeId &&
        !product.warranty
      ) {
        throw new NotFoundError('Product warranty not found', 'NOT_FOUND', {
          code: 'PRODUCT_WARRANTY_NOT_FOUND',
          productId: item.productId,
        });
      }
      if (
        item.activationCodeId &&
        (product.warranty_duration_months ??
          product.warranty?.duration_months ??
          0) <= 0
      ) {
        this.throwValidation('PRODUCT_WARRANTY_POLICY_MISSING', {
          productId: product.id,
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
        (requiresActivationCode &&
          !item.activationCodeId &&
          (!product.warranty ||
            product.warranty.status !== warranty_status.DRAFT ||
            !product.warranty.warranty_code))
      ) {
        this.throwValidation('PRODUCT_NOT_ELIGIBLE_FOR_ACTIVATION_REQUEST', {
          productId: product.id,
        });
      }
      if (!item.activationCodeId && reservedProductIds.has(product.id)) {
        this.throwValidation('ACTIVATION_REQUEST_ALREADY_OPEN', {
          productId: product.id,
        });
      }

      const catalogue = getProductCatalogue(product);
      return {
        activationCodeId: item.activationCodeId ?? null,
        activationFieldId: genericMode
          ? (item.activationFieldId ?? null)
          : (field?.id ?? null),
        positionKey: genericMode ? item.positionKey : field!.key,
        positionLabel: genericMode ? item.positionKey : field!.label,
        productId: product.id,
        productName: getProductDisplayName(product),
        productCode: product.product_code,
        serialNumber: product.serial_number,
        warrantyId: item.activationCodeId
          ? null
          : (product.warranty?.id ?? null),
        warrantyCode: item.activationCodeId
          ? null
          : (product.warranty?.warranty_code ?? null),
        warrantyDurationMonths:
          product.warranty?.duration_months ??
          product.warranty_duration_months ??
          0,
        brand: catalogue.brand,
        model: catalogue.model,
        manufactureYear: catalogue.modelYear,
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
