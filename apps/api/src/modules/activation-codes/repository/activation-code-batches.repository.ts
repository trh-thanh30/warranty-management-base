import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  activation_code_status,
  Prisma,
  warranty_method,
} from '@prisma/client';

export type CreateActivationCodeBatchRecord = {
  batchCode: string;
  sourceProductId: string;
  productSku: string;
  productName: string;
  brand: string | null;
  model: string | null;
  modelYear: number | null;
  warrantyDurationMonths: number;
  warrantyMethod: warranty_method;
  warrantyTerms: string | null;
  quantity: number;
  expiresAt: Date;
  createdById: string;
  codes: Array<{ codeHash: string; codeCiphertext: string }>;
};

@Injectable()
export class ActivationCodeBatchesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(input: CreateActivationCodeBatchRecord) {
    return this.prismaService.activationCodeBatch.create({
      data: {
        batch_code: input.batchCode,
        source_product: { connect: { id: input.sourceProductId } },
        product_sku: input.productSku,
        product_name: input.productName,
        brand: input.brand,
        model: input.model,
        model_year: input.modelYear,
        warranty_duration_months: input.warrantyDurationMonths,
        warranty_method: input.warrantyMethod,
        warranty_terms: input.warrantyTerms,
        quantity: input.quantity,
        expires_at: input.expiresAt,
        created_by: { connect: { id: input.createdById } },
        codes: {
          createMany: {
            data: input.codes.map((code) => ({
              code_hash: code.codeHash,
              code_ciphertext: code.codeCiphertext,
              expires_at: input.expiresAt,
              status: activation_code_status.AVAILABLE,
            })),
          },
        },
      } satisfies Prisma.ActivationCodeBatchCreateInput,
    });
  }
}
