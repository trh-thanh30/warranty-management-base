import { BcryptService } from '@/common/helpers/bcrypt.util';
import { CodeService } from '@/common/helpers/code.util';
import { cookieConfig } from '@/config';
import { PrismaService } from '@/database/prisma/prisma.service';
import { RedisModule } from '@/database/redis/redis.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { VerificationSessionService } from '@/modules/auth/service/verification-session.service';
import { ChangePasswordUseCase } from '@/modules/auth/use-cases/change-password.usecase';
import { ForgotPasswordUseCase } from '@/modules/auth/use-cases/forgot-password.usecase';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.usecase';
import { RefreshTokenUseCase } from '@/modules/auth/use-cases/refresh-token.usecase';
import { RegisterUserUseCase } from '@/modules/auth/use-cases/register-user.usecase';
import { RequestVerificationUseCase } from '@/modules/auth/use-cases/request-verification.usecase';
import { ResendVerificationUseCase } from '@/modules/auth/use-cases/resend-verification.usecase';
import { ResetPasswordUseCase } from '@/modules/auth/use-cases/reset-password.usecase';
import { VerifyAccountUseCase } from '@/modules/auth/use-cases/verify-account.usecase';
import { EmailModule } from '@/modules/email/email.module';
import { UsersModule } from '@/modules/user/user.module';
import { VerificationModule } from '@/modules/verification/verification.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    VerifyAccountUseCase,
    ResendVerificationUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshTokenUseCase,
    RequestVerificationUseCase,
    PrismaService,
    CodeService,
    AuthTokenService,
    VerificationSessionService,
    BcryptService,
    ChangePasswordUseCase,
  ],
  imports: [
    AssetsModule,
    UsersModule,
    EmailModule,
    VerificationModule,
    RedisModule,
    ConfigModule.forFeature(cookieConfig),
  ],
  exports: [
    RegisterUserUseCase,
    LoginUserUseCase,
    VerifyAccountUseCase,
    ResendVerificationUseCase,
    AuthTokenService,
    VerificationSessionService,
    RefreshTokenUseCase,
    RequestVerificationUseCase,
  ],
})
export class AuthModule {}
