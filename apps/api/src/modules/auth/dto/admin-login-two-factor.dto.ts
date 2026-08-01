import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyAdminLoginTwoFactorDto {
  @IsNotEmpty()
  @IsString()
  challengeId: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code: string;
}

export class ResendAdminLoginTwoFactorDto {
  @IsNotEmpty()
  @IsString()
  challengeId: string;
}
