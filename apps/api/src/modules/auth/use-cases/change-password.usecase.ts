import { BcryptService } from '@/common/helpers/bcrypt.util';
import { BadRequestError, UnauthorizedError } from '@/common/response';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { UsersService } from '@/modules/user/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly bcryptService: BcryptService,
  ) {}
  async execute(userId: string, dto: ChangePasswordDto) {
    const currentUser = await this.usersService.findById(userId);

    if (!currentUser) {
      throw new UnauthorizedError('User not found');
    }

    const isPasswordValid = await this.bcryptService.comparePassword(
      dto.currentPassword,
      currentUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const isSamePassword = await this.bcryptService.comparePassword(
      dto.password,
      currentUser.password,
    );

    if (isSamePassword) {
      throw new BadRequestError(
        'New password must be different from current password',
      );
    }

    await this.usersService.update(currentUser.id, {
      password: dto.password,
    });

    return { success: true };
  }
}
