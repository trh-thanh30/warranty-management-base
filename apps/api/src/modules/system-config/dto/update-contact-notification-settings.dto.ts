import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

export class UpdateContactNotificationSettingsDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail()
  @MaxLength(160)
  email: string;
}
