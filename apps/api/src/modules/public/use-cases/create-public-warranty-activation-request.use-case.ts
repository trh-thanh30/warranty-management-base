import { CreatePublicWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-public-warranty-activation-request.dto';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { Injectable } from '@nestjs/common';
import { warranty_activation_request_source } from '@prisma/client';
import type { PublicWarrantyActivationRequestReceipt } from '@repo/shared';

@Injectable()
export class CreatePublicWarrantyActivationRequestUseCase {
  constructor(
    private readonly createWarrantyActivationRequestUseCase: CreateWarrantyActivationRequestUseCase,
  ) {}

  async execute(
    dto: CreatePublicWarrantyActivationRequestDto,
  ): Promise<PublicWarrantyActivationRequestReceipt> {
    const request = await this.createWarrantyActivationRequestUseCase.execute(
      dto,
      { source: warranty_activation_request_source.PUBLIC_WEB },
    );

    return {
      requestCode: request.requestCode,
      status: request.status,
      createdAt: request.createdAt,
    };
  }
}
