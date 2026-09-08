import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { toDealerMembershipResponse } from '@/modules/dealers/dealers.types';
import { AddDealerMemberDto } from '@/modules/dealers/dto/add-dealer-member.dto';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { UsersService } from '@/modules/user/user.service';
import { Injectable } from '@nestjs/common';
import { Prisma, user_role, user_status } from '@prisma/client';

function dealerMembershipExistsError() {
  return new ConflictError(
    'This staff account is already assigned to the dealer',
    'DEALER_MEMBERSHIP_EXISTS',
  );
}

@Injectable()
export class AddDealerMemberUseCase {
  constructor(
    private readonly dealersRepository: DealersRepository,
    private readonly usersService: UsersService,
  ) {}

  async execute(
    dealerId: string,
    dto: AddDealerMemberDto,
    context: { createdByUserId?: string } = {},
  ) {
    const dealer = await this.dealersRepository.findById(dealerId);
    if (!dealer) {
      throw new NotFoundError('Dealer not found', 'DEALER_NOT_FOUND');
    }

    const user = await this.usersService.findById(dto.userId);
    if (!user) {
      throw new NotFoundError(
        'Staff account not found',
        'DEALER_MEMBER_USER_NOT_FOUND',
      );
    }
    if (user.role !== user_role.MODERATOR) {
      throw new BadRequestError(
        'Only staff accounts can be assigned to a dealer',
        'DEALER_MEMBER_USER_NOT_STAFF',
      );
    }
    if (user.status !== user_status.ACTIVE) {
      throw new BadRequestError(
        'Inactive staff accounts cannot be assigned to a dealer',
        'DEALER_MEMBER_USER_INACTIVE',
      );
    }

    const existing = await this.dealersRepository.findMembershipByDealerAndUser(
      dealerId,
      dto.userId,
    );
    if (existing) {
      throw dealerMembershipExistsError();
    }

    try {
      const membership = await this.dealersRepository.createMembership({
        created_by_id: context.createdByUserId,
        dealer_id: dealerId,
        user_id: dto.userId,
      });
      return toDealerMembershipResponse(membership);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw dealerMembershipExistsError();
      }
      throw error;
    }
  }
}
