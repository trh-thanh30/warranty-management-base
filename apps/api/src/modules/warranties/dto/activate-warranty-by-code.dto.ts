import { ActivateWarrantyDto } from '@/modules/warranties/dto/activate-warranty.dto';
import { IsString, Length, Matches } from 'class-validator';

export class ActivateWarrantyByCodeDto extends ActivateWarrantyDto {
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  warrantyCode: string;
}
