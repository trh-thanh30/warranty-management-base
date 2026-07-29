import { IsString, Length } from 'class-validator';

export class VoidWarrantyDto {
  @IsString()
  @Length(3, 1000)
  reason: string;
}
