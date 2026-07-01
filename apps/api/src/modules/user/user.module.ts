import { BcryptService } from '@/common/helpers/bcrypt.util';
import { PermissionsModule } from '@/common/permissions/permissions.module';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { UsersController } from '@/modules/user/user.controller';
import { UsersService } from '@/modules/user/user.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PermissionsModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, BcryptService, AuthTokenService],
  exports: [UsersService],
})
export class UsersModule {}
