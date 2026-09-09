import { BadRequestError, NotFoundError } from '@/common/response';
import { DealerAccessPolicy } from '@/modules/dealers/service/dealer-access.policy';
import type { DealerAccessActor } from '@/modules/dealers/service/dealer-access.policy';
import { CreateAdminWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-admin-warranty-activation-request.dto';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { CreateAdminWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-admin-warranty-activation-request.use-case';
import { Injectable } from '@nestjs/common';
import { warranty_activation_request_status } from '@prisma/client';

@Injectable()
export class UpdateAdminWarrantyActivationRequestUseCase {
  constructor(
    private readonly repository: WarrantyActivationRequestsRepository,
    private readonly createAdminUseCase: CreateAdminWarrantyActivationRequestUseCase,
    private readonly dealerAccessPolicy: DealerAccessPolicy,
  ) {}

  async execute(
    id: string,
    dto: CreateAdminWarrantyActivationRequestDto,
    actor: DealerAccessActor,
  ) {
    const dealerIds =
      await this.dealerAccessPolicy.resolveAccessibleDealerIds(actor);
    const request = dealerIds
      ? await this.repository.findById(id, dealerIds)
      : await this.repository.findById(id);

    if (!request) {
      throw new NotFoundError('Warranty activation request not found');
    }
    if (request.status !== warranty_activation_request_status.PENDING) {
      throw new BadRequestError(
        'Only pending warranty activation requests can be updated',
        'ACTIVATION_REQUEST_NOT_PENDING',
      );
    }

    return this.createAdminUseCase.execute(dto, {
      actor,
      updateRequest: {
        id: request.id,
        items: request.items.map((item) => ({
          activationCodeId: item.activation_code_id,
          positionKey: item.position_key,
          productId: item.product_id,
          warrantyCode: item.warranty_code,
        })),
        requestCode: request.request_code,
        warrantyCode: request.warranty_code,
      },
    });
  }
}
