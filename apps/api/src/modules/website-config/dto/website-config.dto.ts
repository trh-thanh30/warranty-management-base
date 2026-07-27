import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class WebsiteLocaleQueryDto {
  @IsIn(['vi', 'en'])
  @IsOptional()
  locale: 'vi' | 'en' = 'vi';
}

export class WebsiteVersionedDto {
  @IsInt()
  @Min(1)
  expectedVersion: number;
}

class WebsiteOfficeTranslationDto {
  @IsIn(['vi', 'en'])
  locale: 'vi' | 'en';

  @IsString()
  label: string;

  @IsString()
  address: string;
}

class WebsiteOfficeDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  phone: string | null;

  @IsBoolean()
  isActive: boolean;

  @IsInt()
  @Min(0)
  sortOrder: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebsiteOfficeTranslationDto)
  translations: WebsiteOfficeTranslationDto[];
}

class WebsiteSocialLinkDto {
  @IsUUID()
  id: string;

  @IsIn(['FACEBOOK', 'ZALO', 'TIKTOK', 'YOUTUBE', 'OTHER'])
  platform: 'FACEBOOK' | 'ZALO' | 'TIKTOK' | 'YOUTUBE' | 'OTHER';

  @IsString()
  label: string;

  @IsString()
  url: string;

  @IsBoolean()
  isActive: boolean;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class UpdateWebsiteSiteSettingDto extends WebsiteVersionedDto {
  @IsEmail()
  contactEmail: string;

  @IsString()
  @IsNotEmpty()
  websiteUrl: string;

  @IsOptional()
  @IsUUID()
  headerLogoAssetId: string | null;

  @IsOptional()
  @IsUUID()
  footerLogoAssetId: string | null;

  @IsOptional()
  @IsUUID()
  ogImageAssetId: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebsiteOfficeDto)
  offices: WebsiteOfficeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebsiteSocialLinkDto)
  socialLinks: WebsiteSocialLinkDto[];
}
