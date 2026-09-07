import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class TransferWarrantyOwnerDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;
}
