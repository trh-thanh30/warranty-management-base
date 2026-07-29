import { ConflictError } from '@/common/response';
import { CreateDealerDto } from '@/modules/dealers/dto/create-dealer.dto';
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
export class CreateDealerUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(dto: CreateDealerDto) {
    const phone = normalizeDealerPhone(dto.phone);

    if (phone && (await this.dealersRepository.findByPhone(phone))) {
      throw new ConflictError('Dealer phone already exists');
    }

    try {
      const dealer = await this.dealersRepository.create({
        address: dto.address.trim(),
        metadata: normalizeDealerMetadata(dto.metadata),
        name: dto.name.trim(),
        phone,
        province: dto.province.trim(),
        district: optionalTrim(dto.district),
        latitude: dto.latitude,
        longitude: dto.longitude,
        sales_name: optionalTrim(dto.salesName),
      });

      return toDealerResponse(dealer);
    } catch (error) {
      throw mapDealerUniqueConflict(error) ?? error;
    }
  }
}
