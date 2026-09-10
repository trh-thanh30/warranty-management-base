import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  Max,
  MaxLength,
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

  @IsBoolean()
  isHeadquarters: boolean;

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

class WebsiteHeroSlideDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsOptional()
  @IsUUID()
  desktopAssetId: string | null;

  @IsOptional()
  @IsUUID()
  mobileAssetId: string | null;

  @IsBoolean()
  isActive: boolean;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

class WebsiteHomepageDetailDto {
  @IsString()
  @MaxLength(300)
  title: string;

  @IsString()
  @MaxLength(5000)
  description: string;
}

class WebsiteHomepageAboutDto {
  @IsString() @MaxLength(300) eyebrow: string;
  @IsString() @MaxLength(300) title: string;
  @IsString() @MaxLength(5000) descriptionPrimary: string;
  @IsString() @MaxLength(5000) descriptionSecondary: string;
  @IsString() @MaxLength(300) learnMore: string;
  @IsString() @MaxLength(300) hotlineLabel: string;
  @IsString() @MaxLength(300) imageAlt: string;
}

class WebsiteHomepageProductsDto {
  @IsString() @MaxLength(300) eyebrow: string;
  @IsString() @MaxLength(300) title: string;
  @IsString() @MaxLength(5000) description: string;
  @IsString() @MaxLength(300) explore: string;
  @IsString() @MaxLength(300) viewAll: string;
}

class WebsiteHomepageSputterDetailsDto {
  @ValidateNested()
  @Type(() => WebsiteHomepageDetailDto)
  warranty: WebsiteHomepageDetailDto;

  @ValidateNested()
  @Type(() => WebsiteHomepageDetailDto)
  uv: WebsiteHomepageDetailDto;

  @ValidateNested()
  @Type(() => WebsiteHomepageDetailDto)
  ir: WebsiteHomepageDetailDto;
}

class WebsiteHomepageSputterDto {
  @IsString() @MaxLength(300) eyebrow: string;
  @IsString() @MaxLength(300) title: string;
  @IsString() @MaxLength(5000) descriptionPrimary: string;
  @IsString() @MaxLength(5000) descriptionSecondary: string;
  @IsString() @MaxLength(300) learnMore: string;
  @IsString() @MaxLength(300) chamberImageAlt: string;
  @IsString() @MaxLength(300) structureImageAlt: string;

  @IsInt() @Min(0) @Max(100) warrantyYears: number;
  @IsString() @MaxLength(30) yearsSuffix: string;
  @IsInt() @Min(0) @Max(100) uvPercent: number;
  @IsInt() @Min(0) @Max(100) irPercent: number;
  @IsString() @MaxLength(300) warrantyLabel: string;
  @IsString() @MaxLength(300) uvLabel: string;
  @IsString() @MaxLength(300) irLabel: string;

  @ValidateNested()
  @Type(() => WebsiteHomepageSputterDetailsDto)
  details: WebsiteHomepageSputterDetailsDto;
}

class WebsiteHomepageComparisonDto {
  @IsString() @MaxLength(300) eyebrow: string;
  @IsString() @MaxLength(5000) description: string;
  @IsString() @MaxLength(300) bookNow: string;
  @IsString() @MaxLength(300) standardTitle: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  standardItems: [string, string, string];

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  fujitekItems: [string, string, string];
}

class WebsiteHomepageFaqDto {
  @IsString()
  @MaxLength(300)
  eyebrow: string;
}

class WebsiteEditableTextDto {
  @IsString() @MaxLength(5000) content: string;
  @IsIn(['heading', 'body']) font: 'heading' | 'body';
  @IsIn(['s', 'm', 'l', 'xl', '2xl']) size: 's' | 'm' | 'l' | 'xl' | '2xl';
  @IsIn(['default', 'muted', 'primary', 'inverse'])
  color: 'default' | 'muted' | 'primary' | 'inverse';
  @IsIn(['left', 'center', 'right']) align: 'left' | 'center' | 'right';
  @IsBoolean() bold: boolean;
  @IsBoolean() italic: boolean;
}

class WebsiteHomepageLandingHeroDto {
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  eyebrow: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  titlePrefix: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  titleHighlight: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  titleSuffix: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  description: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  primaryCta: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  dealerCta: WebsiteEditableTextDto;
  @IsInt() @Min(0) @Max(100) uvPercent: number;
  @IsInt() @Min(0) @Max(100) originPercent: number;
  @IsInt() @Min(0) @Max(100) warrantyYears: number;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  uvLabel: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  originLabel: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  warrantyLabel: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  yearsSuffix: WebsiteEditableTextDto;
}

class WebsiteHomepageLandingBrandDto {
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  brandLabel: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  headlineLine1: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  headlineLine2Prefix: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  headlineHighlight: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  headlineLine3: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  descriptionPrimary: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  descriptionSecondary: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  originEyebrow: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  originTitle: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  originDescriptionPrimary: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  originDescriptionSecondary: WebsiteEditableTextDto;
}

class WebsiteHomepageLandingHeaderDto {
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  eyebrow: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  title: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  description: WebsiteEditableTextDto;
}

class WebsiteHomepageLandingShortHeaderDto {
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  eyebrow: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  title: WebsiteEditableTextDto;
}

class WebsiteHomepageLandingNetworkDto {
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  eyebrow: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  titlePrefix: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  titleSuffix: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  description: WebsiteEditableTextDto;
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  viewDealersCta: WebsiteEditableTextDto;
}

class WebsiteHomepageLandingB2bDto extends WebsiteHomepageLandingHeaderDto {
  @ValidateNested()
  @Type(() => WebsiteEditableTextDto)
  partnerCta: WebsiteEditableTextDto;
}

class WebsiteHomepageLandingDto {
  @ValidateNested()
  @Type(() => WebsiteHomepageLandingHeroDto)
  hero: WebsiteHomepageLandingHeroDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageLandingBrandDto)
  brandHeritage: WebsiteHomepageLandingBrandDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageLandingHeaderDto)
  coreTech: WebsiteHomepageLandingHeaderDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageLandingHeaderDto)
  milestones: WebsiteHomepageLandingHeaderDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageLandingShortHeaderDto)
  pillars: WebsiteHomepageLandingShortHeaderDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageLandingNetworkDto)
  network: WebsiteHomepageLandingNetworkDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageLandingShortHeaderDto)
  testimonials: WebsiteHomepageLandingShortHeaderDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageLandingB2bDto)
  b2b: WebsiteHomepageLandingB2bDto;
}

class WebsiteHomepageCopyDto {
  @ValidateNested()
  @Type(() => WebsiteHomepageLandingDto)
  landing: WebsiteHomepageLandingDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageAboutDto)
  about: WebsiteHomepageAboutDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageProductsDto)
  products: WebsiteHomepageProductsDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageSputterDto)
  sputter: WebsiteHomepageSputterDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageComparisonDto)
  comparison: WebsiteHomepageComparisonDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageFaqDto)
  faq: WebsiteHomepageFaqDto;
}

class WebsiteHomepageContentDto {
  @ValidateNested()
  @Type(() => WebsiteHomepageCopyDto)
  vi: WebsiteHomepageCopyDto;
  @ValidateNested()
  @Type(() => WebsiteHomepageCopyDto)
  en: WebsiteHomepageCopyDto;
}

class WebsiteHomepageDto {
  @IsOptional() @IsUUID() aboutImageAssetId: string | null;
  @IsOptional() @IsUUID() sputterChamberImageAssetId: string | null;
  @IsOptional() @IsUUID() sputterStructureImageAssetId: string | null;

  @ValidateNested()
  @Type(() => WebsiteHomepageContentDto)
  content: WebsiteHomepageContentDto;
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
  @Type(() => WebsiteHeroSlideDto)
  heroSlides: WebsiteHeroSlideDto[];

  @ValidateNested()
  @Type(() => WebsiteHomepageDto)
  homepage: WebsiteHomepageDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebsiteOfficeDto)
  offices: WebsiteOfficeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebsiteSocialLinkDto)
  socialLinks: WebsiteSocialLinkDto[];
}
