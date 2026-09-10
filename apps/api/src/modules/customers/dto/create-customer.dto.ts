import { IsBirthdate } from '@/common/decorators/is-birthdate.decorator';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateIf,
} from 'class-validator';

export class CreateCustomerDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @Length(4, 32)
  customerCode?: string;

  @IsString()
  @Length(2, 120)
  fullName: string;

  @IsString()
  @Length(6, 32)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBirthdate()
  birthdate?: string;
}
