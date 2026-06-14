import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetWithUrl } from '@/modules/assets/dto/asset-response.dto';
import { ListAssetsDto } from '@/modules/assets/dto/list-assets.dto';
import { UploadAssetDto } from '@/modules/assets/dto/upload-asset.dto';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Asset, asset_access_type, asset_type, User } from '@prisma/client';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  /**
   * Upload a file and save metadata to DB
   */
  async uploadFile(
    user: User,
    file: Express.Multer.File,
    dto: UploadAssetDto,
  ): Promise<AssetWithUrl> {
    const uploadResult = await this.uploadAssetService.upload(file, {
      folder: dto.folder,
      accessType: dto.accessType,
    });

    const asset = await this.prisma.asset.create({
      data: {
        original_name: uploadResult.originalName,
        filename: uploadResult.filename,
        mime_type: uploadResult.mimeType,
        size: uploadResult.size,
        path: uploadResult.path,
        access_type: dto.accessType || asset_access_type.PUBLIC,
        type: (dto.type as any) || uploadResult.type,
        uploaded_by_id: user?.id || null,
        folder: dto.folder || null,
        metadata: {},
        links:
          dto.entityId && dto.entityType
            ? {
                create: {
                  entity_id: dto.entityId,
                  entity_type: dto.entityType,
                },
              }
            : undefined,
      },
    });

    return this.enrichAssetUrl(asset);
  }

  async uploadRemoteImage(
    imageUrl: string,
    dto: UploadAssetDto = {},
    user?: User | null,
  ): Promise<AssetWithUrl> {
    const normalizedUrl = imageUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      throw new Error('Remote image URL must be an absolute HTTP URL');
    }

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'booking-base-assets/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download remote image (${response.status})`);
    }

    const contentType =
      response.headers.get('content-type')?.split(';')[0]?.trim() ||
      this.guessMimeType(normalizedUrl);

    if (!contentType.startsWith('image/')) {
      throw new Error(`Remote URL is not an image (${contentType})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = this.remoteImageFileName(normalizedUrl, contentType);
    const file = {
      fieldname: 'images',
      originalname: fileName,
      encoding: '7bit',
      mimetype: contentType,
      size: buffer.length,
      buffer,
    } as Express.Multer.File;

    return this.uploadFile(user as User, file, dto);
  }

  isManagedPublicUrl(url: string) {
    return this.uploadAssetService.isPublicCdnUrl(url);
  }

  /**
   * Get asset by ID
   */
  async getAsset(id: string): Promise<AssetWithUrl> {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset || asset.is_deleted) {
      throw new NotFoundException('Asset not found');
    }

    return this.enrichAssetUrl(asset);
  }

  /**
   * List assets (for Admin)
   */
  async listAssets(dto: ListAssetsDto) {
    const {
      page = 1,
      limit = 10,
      uploadedById,
      type,
      accessType,
      folder,
    } = dto;
    const skip = (page - 1) * limit;

    const where = {
      is_deleted: false,
      uploaded_by_id: uploadedById,
      type,
      access_type: accessType,
      folder: folder ? { contains: folder } : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data: items.map((asset) => this.enrichAssetUrl(asset)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listAssetsThumbnail() {
    const where = {
      is_deleted: false,
      access_type: asset_access_type.PUBLIC,
      type: asset_type.THUMBNAIL,
    };

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        take: 10,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data: items.map((asset) => this.enrichAssetUrl(asset)),
      pagination: {
        total,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(total / 10),
      },
    };
  }

  /**
   * Delete asset (Soft Delete)
   */
  async deleteAsset(id: string, user: User): Promise<void> {
    const asset = await this.prisma.asset.findUnique({ where: { id } });

    if (!asset || asset.is_deleted) {
      throw new NotFoundException('Asset not found');
    }

    if (asset.uploaded_by_id !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this asset',
      );
    }

    await this.uploadAssetService.delete(asset.path);

    await this.prisma.asset.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  async deleteAssetByUrl(
    url: string,
    options: { folder?: string; types?: asset_type[] } = {},
  ): Promise<void> {
    const asset = await this.findAssetByUrl(url, options);

    if (!asset) {
      return;
    }

    await this.uploadAssetService.delete(asset.path);

    await this.prisma.asset.delete({
      where: { id: asset.id },
    });
  }

  private async findAssetByUrl(
    url: string,
    options: { folder?: string; types?: asset_type[] },
  ): Promise<Asset | null> {
    const normalizedUrl = url.trim();

    if (!normalizedUrl) {
      return null;
    }

    const assets = await this.prisma.asset.findMany({
      where: {
        is_deleted: false,
        folder: options.folder,
        type: options.types?.length ? { in: options.types } : undefined,
      },
    });

    return (
      assets.find((asset) => {
        const assetUrl = this.enrichAssetUrl(asset).url;
        return assetUrl === normalizedUrl || asset.path === normalizedUrl;
      }) ?? null
    );
  }

  /**
   * Resolve full URL for an asset
   */
  public enrichAssetUrl(asset: Asset): AssetWithUrl {
    const url = this.uploadAssetService.getFullUrl(
      asset.path,
      asset.access_type,
      asset.id,
    );
    return {
      ...asset,
      url,
      metadata: asset.metadata as Record<string, unknown>,
    };
  }

  private remoteImageFileName(url: string, mimeType: string) {
    try {
      const pathname = new URL(url).pathname;
      const fileName = pathname.split('/').filter(Boolean).pop();
      if (fileName && /\.[a-z0-9]+$/i.test(fileName)) {
        return fileName;
      }
    } catch {
      // Fall through to MIME-derived name.
    }

    return `remote-image.${this.extensionFromMimeType(mimeType)}`;
  }

  private guessMimeType(url: string) {
    const lower = url.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    return 'image/jpeg';
  }

  private extensionFromMimeType(mimeType: string) {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
    };
    return map[mimeType] ?? 'jpg';
  }
}
