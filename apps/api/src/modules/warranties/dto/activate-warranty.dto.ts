import { IsDateString, IsOptional } from 'class-validator';

export class ActivateWarrantyDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;
}
