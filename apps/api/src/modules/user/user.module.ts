import { BcryptService } from '@/common/helpers/bcrypt.util';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { UsersController } from '@/modules/user/user.controller';
import { UsersService } from '@/modules/user/user.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, BcryptService, AuthTokenService],
  exports: [UsersService],
})
export class UsersModule {}
