import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateServiceCenterDto {
  @IsString()
  @Length(2, 160)
  name: string;

  @IsOptional()
  @IsString()
  @Length(6, 32)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Length(2, 120)
  province: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  district?: string;

  @IsString()
  @Length(4, 255)
  address: string;
}
