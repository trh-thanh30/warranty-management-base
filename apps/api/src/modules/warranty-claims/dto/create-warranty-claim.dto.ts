import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateWarrantyClaimDto {
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  warrantyCode: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Matches(/\S/)
  requesterName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 32)
  @Matches(/\S/)
  requesterPhone: string;

  @IsString()
  @Length(3, 255)
  issueTitle: string;

  @IsOptional()
  @IsString()
  @Length(1, 4000)
  issueDetail?: string;
}
