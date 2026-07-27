import { Public } from '@/common/decorators/public.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AssetsService } from '@/modules/assets/assets.service';
import { DeleteAssetByUrlDto } from '@/modules/assets/dto/delete-asset-by-url.dto';
import { ListAssetsDto } from '@/modules/assets/dto/list-assets.dto';
import { UploadAssetDto } from '@/modules/assets/dto/upload-asset.dto';
import { GetStorageUsageUseCase } from '@/modules/assets/use-cases/get-storage-usage.use-case';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { permission_key, type User as UserEntity } from '@prisma/client';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly getStorageUsageUseCase: GetStorageUsageUseCase,
  ) {}

  /**
   * Upload a file
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @User() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
    @Query() dto: UploadAssetDto,
  ) {
    return this.assetsService.uploadFile(user, file, dto);
  }

  @Public()
  @Get('thumbnail')
  async findAllThumbnail() {
    return this.assetsService.listAssetsThumbnail();
  }

  @Get('storage-usage')
  @Roles(['ADMIN'])
  @Permissions([permission_key.SYSTEM_VIEW])
  storageUsage() {
    return this.getStorageUsageUseCase.execute();
  }

  /**
   * Get asset metadata
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.getAsset(id);
  }

  /**
   * List assets for Admin and website-config editors.
   */
  @Get()
  @Roles(['ADMIN', 'MODERATOR'])
  @Permissions([permission_key.WEBSITE_CONFIG_VIEW])
  async findAll(@Query() dto: ListAssetsDto) {
    return this.assetsService.listAssets(dto);
  }

  /**
   * Delete an asset
   */
  @Delete('by-url')
  async removeByUrl(
    @User() user: UserEntity,
    @Query() dto: DeleteAssetByUrlDto,
  ) {
    await this.assetsService.deleteAssetByUrl(dto.url, {}, user);
  }

  @Delete(':id')
  async remove(
    @User() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assetsService.deleteAsset(id, user);
  }
}
