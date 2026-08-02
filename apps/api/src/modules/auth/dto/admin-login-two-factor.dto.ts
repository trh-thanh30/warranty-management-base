import { IsIn, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import type { AdminTwoFactorMethod } from '@repo/shared';
import { ADMIN_TWO_FACTOR_METHOD } from '@repo/shared/constants';

export class SelectAdminLoginMethodDto {
  @IsNotEmpty()
  @IsString()
  challengeId: string;

  @IsIn(Object.values(ADMIN_TWO_FACTOR_METHOD))
  method: AdminTwoFactorMethod;
}

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

export class SetupAdminLoginPinDto {
  @IsNotEmpty()
  @IsString()
  challengeId: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  pin: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  confirmPin: string;
}

export class VerifyAdminLoginPinDto {
  @IsNotEmpty()
  @IsString()
  challengeId: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  pin: string;
}
