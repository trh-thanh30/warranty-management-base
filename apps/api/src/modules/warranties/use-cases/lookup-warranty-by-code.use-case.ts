import { NotFoundError } from '@/common/response';
import {
  DealerAccessActor,
  DealerAccessPolicy,
} from '@/modules/dealers/service/dealer-access.policy';
import { LookupWarrantyDto } from '@/modules/warranties/dto/lookup-warranty.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyLookupResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';

@Injectable()
export class LookupWarrantyByCodeUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
    private readonly activationCodeCryptoService?: ActivationCodeCryptoService,
  ) {}

  async execute(dto: LookupWarrantyDto, actor?: DealerAccessActor) {
    const code = dto.code.trim().toUpperCase();
    const warranty = await this.warrantiesRepository.findByWarrantyCode(code);

    if (!warranty) {
      throw new NotFoundError('Warranty not found');
    }
    if (actor) {
      await this.dealerAccessPolicy!.assertCanAccessRecord(
        actor,
        warranty.dealer_id,
      );
    }

    return toWarrantyLookupResponse({
      activationCode:
        warranty.activation_code?.code_ciphertext &&
        this.activationCodeCryptoService
          ? this.activationCodeCryptoService.decrypt(
              warranty.activation_code.code_ciphertext,
            )
          : null,
      product: warranty.product,
      warranty,
    });
  }
}
