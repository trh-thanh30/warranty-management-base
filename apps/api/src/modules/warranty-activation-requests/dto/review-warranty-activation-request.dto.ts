import { warranty_activation_request_status } from '@prisma/client';
import {
  IsIn,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class ReviewWarrantyActivationRequestDto {
  @IsIn([
    warranty_activation_request_status.APPROVED,
    warranty_activation_request_status.REJECTED,
  ])
  status:
    | typeof warranty_activation_request_status.APPROVED
    | typeof warranty_activation_request_status.REJECTED;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  adminNote?: string;

  @ValidateIf(
    (dto: ReviewWarrantyActivationRequestDto) =>
      dto.status === warranty_activation_request_status.REJECTED,
  )
  @IsString()
  @Length(1, 2000)
  rejectionReason?: string;

  @IsOptional()
  @IsIn(['vi', 'en'])
  locale?: 'vi' | 'en';
}
