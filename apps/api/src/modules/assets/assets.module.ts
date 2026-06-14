import { storageConfig } from '@/config';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetsController } from '@/modules/assets/assets.controller';
import { AssetsService } from '@/modules/assets/assets.service';
import { FileValidatorService } from '@/modules/assets/services/file-validator.service';
import { LocalStorageService } from '@/modules/assets/services/local-storage.service';
import { MinioStorageService } from '@/modules/assets/services/minio-storage.service';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [AssetsController],
  providers: [
    PrismaService,
    AuthTokenService,
    AssetsService,
    UploadAssetService,
    FileValidatorService,
    {
      provide: 'IStorageService',
      inject: [storageConfig.KEY],
      useFactory: (config: ConfigType<typeof storageConfig>) =>
        config.driver === 'minio'
          ? new MinioStorageService(config)
          : new LocalStorageService(config),
    },
  ],
  exports: [AssetsService, UploadAssetService],
})
export class AssetsModule {}
