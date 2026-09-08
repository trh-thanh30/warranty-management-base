import { ConflictError } from '@/common/response';
import { CreateDealerDto } from '@/modules/dealers/dto/create-dealer.dto';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { DEALER_MEMBERSHIP_ACCESS_ENABLED } from '@/modules/dealers/dealers.constants';
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
import { GenerateDealerCodeUseCase } from '@/modules/dealers/use-cases/generate-dealer-code.use-case';
import { user_role } from '@prisma/client';

@Injectable()
export class CreateDealerUseCase {
  constructor(
    private readonly dealersRepository: DealersRepository,
    private readonly generateDealerCodeUseCase: GenerateDealerCodeUseCase = new GenerateDealerCodeUseCase(),
  ) {}

  async execute(
    dto: CreateDealerDto,
    context: { userId?: string; userRole?: string } = {},
  ) {
    const phone = normalizeDealerPhone(dto.phone);

    if (phone && (await this.dealersRepository.findByPhone(phone))) {
      throw new ConflictError('Dealer phone already exists');
    }

    try {
      const dealer = await this.dealersRepository.create({
        dealer_code: this.generateDealerCodeUseCase.execute(),
        address: dto.address.trim(),
        metadata: normalizeDealerMetadata(dto.metadata),
        name: dto.name.trim(),
        phone,
        province: dto.province.trim(),
        district: optionalTrim(dto.district),
        latitude: dto.latitude,
        longitude: dto.longitude,
        sales_name: optionalTrim(dto.salesName),
        memberships:
          DEALER_MEMBERSHIP_ACCESS_ENABLED &&
          context.userId &&
          context.userRole === user_role.MODERATOR
            ? {
                create: {
                  created_by: { connect: { id: context.userId } },
                  user: { connect: { id: context.userId } },
                },
              }
            : undefined,
      });

      return toDealerResponse(dealer);
    } catch (error) {
      throw mapDealerUniqueConflict(error) ?? error;
    }
  }
}
