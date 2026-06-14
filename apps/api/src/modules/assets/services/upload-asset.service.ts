import { storageConfig } from '@/config';
import { FileValidatorService } from '@/modules/assets/services/file-validator.service';
import type { IStorageService } from '@/modules/assets/services/storage.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { asset_access_type, asset_type } from '@prisma/client';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  type: asset_type;
}

@Injectable()
export class UploadAssetService {
  private readonly logger = new Logger(UploadAssetService.name);
  private readonly cdnUrl: string;

  constructor(
    @Inject('IStorageService') private readonly storage: IStorageService,
    private readonly fileValidator: FileValidatorService,
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {
    this.cdnUrl = this.config.cdnUrl;
  }

  /**
   * Validate and save file to storage
   */
  async upload(
    file: Express.Multer.File,
    options: {
      folder?: string;
      accessType?: asset_access_type;
    } = {},
  ): Promise<UploadResult> {
    // 1. Validate File
    this.fileValidator.validateFile(file);

    const { folder, accessType = asset_access_type.PUBLIC } = options;

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // Organize by year/month/folder
    const folderPath = folder
      ? `${year}/${month}/${folder}`
      : `${year}/${month}`;
    const fileExt = path.extname(file.originalname);
    const uniqueName = `${Date.now()}_${uuidv4()}${fileExt}`;

    // 2. Save to Storage
    const { path: relativePath, size } = await this.storage.save(
      file,
      folderPath,
      uniqueName,
      accessType,
    );

    return {
      originalName: file.originalname,
      filename: uniqueName,
      path: relativePath,
      size: size,
      mimeType: file.mimetype,
      type: this.determineAssetType(file.mimetype),
    };
  }

  /**
   * Delete file from storage
   */
  async delete(filePath: string): Promise<void> {
    try {
      await this.storage.delete(filePath);
    } catch (error: any) {
      this.logger.warn(
        `Failed to delete file on disk at ${filePath}: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  public determineAssetType(mime: string): asset_type {
    if (mime.startsWith('image/')) return asset_type.IMAGE;
    if (mime.startsWith('video/')) return asset_type.VIDEO;
    if (mime.startsWith('audio/')) return asset_type.AUDIO;
    if (mime === 'application/pdf' || mime.includes('document'))
      return asset_type.DOCUMENT;
    return asset_type.OTHER;
  }

  /**
   * Resolve full URL for an asset/media path
   */
  public getFullUrl(
    filePath: string,
    accessType: asset_access_type = asset_access_type.PUBLIC,
    id?: string,
  ): string {
    if (accessType === asset_access_type.PUBLIC) {
      const normalizedPath = filePath.trim().replace(/\\/g, '/');
      const cleanPath = normalizedPath.startsWith('public/')
        ? normalizedPath.replace(/^public\//, '')
        : normalizedPath;
      return `${this.cdnUrl}/${cleanPath}`;
    }

    // For private files, return API direct link if ID is provided
    return id ? `/api/v1/assets/private/${id}/stream` : filePath;
  }

  public isPublicCdnUrl(url: string): boolean {
    const normalized = url.trim();
    return Boolean(normalized) && normalized.startsWith(`${this.cdnUrl}/`);
  }
}
