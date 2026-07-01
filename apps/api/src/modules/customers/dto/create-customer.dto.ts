import { IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCustomerDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  @Length(4, 32)
  customerCode?: string;

  @IsString()
  @Length(2, 120)
  fullName: string;

  @IsOptional()
  @IsString()
  @Length(6, 32)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  address?: string;
}
