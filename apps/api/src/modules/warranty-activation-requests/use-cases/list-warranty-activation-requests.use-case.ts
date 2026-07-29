import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListWarrantyActivationRequestsUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
  ) {}

  async execute(filters: ListWarrantyActivationRequestsDto) {
    const result =
      await this.warrantyActivationRequestsRepository.list(filters);

    return {
      items: result.items.map(toWarrantyActivationRequestResponse),
      meta: result.meta,
    };
  }
}
