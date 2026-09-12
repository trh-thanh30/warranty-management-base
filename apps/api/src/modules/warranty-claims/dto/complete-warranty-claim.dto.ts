import { IsOptional, IsString, Length } from 'class-validator';

export class CompleteWarrantyClaimDto {
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  note?: string;
}
