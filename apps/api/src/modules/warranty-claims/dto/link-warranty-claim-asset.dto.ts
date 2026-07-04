import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class LinkWarrantyClaimAssetDto {
  @IsUUID()
  assetId: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  note?: string;
}
