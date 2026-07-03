import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class AssignWarrantyClaimServiceCenterDto {
  @IsUUID()
  serviceCenterId: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  note?: string;
}
