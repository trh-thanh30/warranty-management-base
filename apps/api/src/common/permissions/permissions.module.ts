import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { PermissionService } from '@/common/permissions/permissions.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionsModule {}
