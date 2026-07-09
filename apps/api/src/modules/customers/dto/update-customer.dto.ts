import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  fullName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(6, 32)
  phone?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEmail()
  email?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(1, 255)
  address?: string;
}
