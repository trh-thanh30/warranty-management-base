import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class AssignProductOwnerDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  activatedAt?: string;
}
