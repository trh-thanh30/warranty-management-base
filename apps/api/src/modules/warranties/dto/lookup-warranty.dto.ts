import { IsString, Length, Matches } from 'class-validator';

export class LookupWarrantyDto {
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  code: string;
}
