import { ConflictError, NotFoundError } from '@/common/response';
import { UpdateDealerDto } from '@/modules/dealers/dto/update-dealer.dto';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import {
  normalizeDealerMetadata,
  toDealerResponse,
} from '@/modules/dealers/dealers.types';
import {
  mapDealerUniqueConflict,
  normalizeDealerPhone,
  optionalTrim,
} from '@/modules/dealers/dealers.utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateDealerUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(id: string, dto: UpdateDealerDto) {
    const existingDealer = await this.dealersRepository.findById(id);

    if (!existingDealer) {
      throw new NotFoundError('Dealer not found');
    }

    const phone =
      dto.phone === undefined ? undefined : normalizeDealerPhone(dto.phone);

    if (
      phone &&
      phone !== existingDealer.phone &&
      (await this.dealersRepository.findByPhone(phone, id))
    ) {
      throw new ConflictError('Dealer phone already exists');
    }

    try {
      const dealer = await this.dealersRepository.update(id, {
        address: dto.address?.trim(),
        is_active: dto.isActive,
        metadata: normalizeDealerMetadata(dto.metadata),
        name: dto.name?.trim(),
        phone,
        province: dto.province?.trim(),
        district:
          dto.district === undefined ? undefined : optionalTrim(dto.district),
        sales_name:
          dto.salesName === undefined ? undefined : optionalTrim(dto.salesName),
      });

      return toDealerResponse(dealer);
    } catch (error) {
      throw mapDealerUniqueConflict(error) ?? error;
    }
  }
}
