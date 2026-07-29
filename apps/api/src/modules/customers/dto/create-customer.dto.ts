import { IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

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

  @IsEmail()
  email: string;

  @IsString()
  @Length(1, 255)
  address: string;
}
