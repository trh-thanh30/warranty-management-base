import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class AssignProductOwnerDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsBoolean()
  autoGenerateWarrantyCode?: boolean;

  @IsOptional()
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  warrantyCode?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;
}
