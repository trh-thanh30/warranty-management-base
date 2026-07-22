import { BcryptService } from '@/common/helpers/bcrypt.util';
import { PermissionsModule } from '@/common/permissions/permissions.module';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { UsersController } from '@/modules/user/user.controller';
import { UsersService } from '@/modules/user/user.service';
import { DownloadStaffImportTemplateUseCase } from '@/modules/user/use-cases/download-staff-import-template.use-case';
import { ExportStaffUseCase } from '@/modules/user/use-cases/export-staff.use-case';
import { ImportStaffUseCase } from '@/modules/user/use-cases/import-staff.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PermissionsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    BcryptService,
    AuthTokenService,
    DownloadStaffImportTemplateUseCase,
    ExportStaffUseCase,
    ImportStaffUseCase,
  ],
  exports: [UsersService],
})
export class UsersModule {}
