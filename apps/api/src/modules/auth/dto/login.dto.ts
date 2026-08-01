// file: src/auth/dto/login.dto.ts

import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  ADMIN_TWO_FACTOR_METHOD,
  type AdminTwoFactorMethod,
} from '@repo/shared';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  usernameOrEmail: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsIn(Object.values(ADMIN_TWO_FACTOR_METHOD))
  method?: AdminTwoFactorMethod;
}
