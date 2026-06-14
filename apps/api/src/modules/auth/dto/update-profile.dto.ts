import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const optionalText = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  username?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @Transform(optionalText)
  @IsString()
  @MaxLength(120)
  full_name?: string | null;

  @IsOptional()
  @Transform(optionalText)
  @IsString()
  @MaxLength(32)
  phone?: string | null;

  @IsOptional()
  @IsString()
  avatar_url?: string | null;
}
