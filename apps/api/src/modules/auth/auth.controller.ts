import { ApiSuccess } from '@/common/decorators/api-response.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PermissionService } from '@/common/permissions/permissions.service';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@/common/response';
import { cookieConfig } from '@/config';
import { AssetsService } from '@/modules/assets/assets.service';
import { AssetAccessTypeDto } from '@/modules/assets/dto/upload-asset.dto';
import {
  ResendAdminLoginTwoFactorDto,
  SelectAdminLoginMethodDto,
  SetupAdminLoginPinDto,
  VerifyAdminLoginPinDto,
  VerifyAdminLoginTwoFactorDto,
} from '@/modules/auth/dto/admin-login-two-factor.dto';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { RequestVerificationDto } from '@/modules/auth/dto/request-verification.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { UpdateProfileDto } from '@/modules/auth/dto/update-profile.dto';
import { VerifyEmailDto } from '@/modules/auth/dto/verify-email.dto';
import { ChangePasswordUseCase } from '@/modules/auth/use-cases/change-password.usecase';
import { ForgotPasswordUseCase } from '@/modules/auth/use-cases/forgot-password.usecase';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.usecase';
import { RefreshTokenUseCase } from '@/modules/auth/use-cases/refresh-token.usecase';
import { RegisterUserUseCase } from '@/modules/auth/use-cases/register-user.usecase';
import { RequestVerificationUseCase } from '@/modules/auth/use-cases/request-verification.usecase';
import { ResendAdminLoginTwoFactorUseCase } from '@/modules/auth/use-cases/resend-admin-login-two-factor.usecase';
import { ResendVerificationUseCase } from '@/modules/auth/use-cases/resend-verification.usecase';
import { ResetPasswordUseCase } from '@/modules/auth/use-cases/reset-password.usecase';
import { SelectAdminLoginMethodUseCase } from '@/modules/auth/use-cases/select-admin-login-method.usecase';
import { SetupAdminLoginPinUseCase } from '@/modules/auth/use-cases/setup-admin-login-pin.usecase';
import { StartAdminLoginUseCase } from '@/modules/auth/use-cases/start-admin-login.usecase';
import { VerifyAccountUseCase } from '@/modules/auth/use-cases/verify-account.usecase';
import { VerifyAdminLoginPinUseCase } from '@/modules/auth/use-cases/verify-admin-login-pin.usecase';
import { VerifyAdminLoginTwoFactorUseCase } from '@/modules/auth/use-cases/verify-admin-login-two-factor.usecase';
import { UsersService } from '@/modules/user/user.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import {
  asset_type,
  user_role,
  type User as CurrentUser,
} from '@prisma/client';
import { normalizeUserRole } from '@repo/shared/constants';
import express from 'express';

type AuthRequestUser = CurrentUser;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly startAdminLoginUseCase: StartAdminLoginUseCase,
    private readonly selectAdminLoginMethodUseCase: SelectAdminLoginMethodUseCase,
    private readonly verifyAdminLoginTwoFactorUseCase: VerifyAdminLoginTwoFactorUseCase,
    private readonly resendAdminLoginTwoFactorUseCase: ResendAdminLoginTwoFactorUseCase,
    private readonly setupAdminLoginPinUseCase: SetupAdminLoginPinUseCase,
    private readonly verifyAdminLoginPinUseCase: VerifyAdminLoginPinUseCase,
    private readonly verifyAccountUseCase: VerifyAccountUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly requestVerificationUseCase: RequestVerificationUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly usersService: UsersService,
    private readonly assetsService: AssetsService,
    private readonly permissionService: PermissionService,
    @Inject(cookieConfig.KEY)
    private readonly configCookie: ConfigType<typeof cookieConfig>,
  ) {}

  @Public()
  @Post('register')
  @ApiSuccess(
    'Account registered successfully. Please check your email for verification.',
  )
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUserUseCase.execute(dto);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  @Post('login-admin')
  @ApiSuccess('Login credentials accepted')
  async loginAdmin(@Body() dto: LoginDto) {
    return this.startAdminLoginUseCase.execute(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  @Post('login-admin/select-method')
  @ApiSuccess('Verification method selected')
  async selectAdminLoginMethod(@Body() dto: SelectAdminLoginMethodDto) {
    return this.selectAdminLoginMethodUseCase.execute(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 300_000 } })
  @Post('login-admin/verify-2fa')
  @ApiSuccess('Login successful')
  async verifyAdminLoginTwoFactor(
    @Body() dto: VerifyAdminLoginTwoFactorDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.verifyAdminLoginTwoFactorUseCase.execute(dto);
    this.setRefreshCookies(res, 'admin', result.refresh_token);
    return {
      access_token: result.access_token,
      user: await this.toAuthUser(result.user.id),
    };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 300_000 } })
  @Post('login-admin/resend-2fa')
  @ApiSuccess('Verification code resent')
  async resendAdminLoginTwoFactor(@Body() dto: ResendAdminLoginTwoFactorDto) {
    return this.resendAdminLoginTwoFactorUseCase.execute(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  @Post('login-admin/setup-pin')
  @ApiSuccess('PIN created and login successful')
  async setupAdminLoginPin(
    @Body() dto: SetupAdminLoginPinDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.setupAdminLoginPinUseCase.execute(dto);
    this.setRefreshCookies(res, 'admin', result.refresh_token);
    return {
      access_token: result.access_token,
      user: await this.toAuthUser(result.user.id),
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 300_000 } })
  @Post('login-admin/verify-pin')
  @ApiSuccess('PIN verified and login successful')
  async verifyAdminLoginPin(
    @Body() dto: VerifyAdminLoginPinDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.verifyAdminLoginPinUseCase.execute(dto);
    this.setRefreshCookies(res, 'admin', result.refresh_token);
    return {
      access_token: result.access_token,
      user: await this.toAuthUser(result.user.id),
    };
  }

  @Public()
  @Post('login')
  @ApiSuccess('Login successful')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.loginUserUseCase.execute(dto, user_role.CUSTOMER);
    this.setRefreshCookies(res, 'client', result.refresh_token);

    return {
      access_token: result.access_token,
      user: await this.toAuthUser(result.user.id),
    };
  }

  @Public()
  @Post('refresh')
  @ApiSuccess('Token refreshed successfully')
  async refresh(
    @Headers('x-auth-context') authContext: string | undefined,
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<{ access_token: string }> {
    const context = this.resolveAuthContext(authContext);
    const cookieNames = this.getRefreshCookieNames(context);
    const refreshToken = (req.cookies as Record<string, string>)?.[
      cookieNames.refreshToken
    ];

    try {
      const result = await this.refreshTokenUseCase.execute(
        refreshToken,
        this.getRequiredRoles(context),
      );

      this.setRefreshCookies(res, context, result.refresh_token);

      return {
        access_token: result.access_token,
      };
    } catch (error) {
      this.clearRefreshCookies(res, context);
      throw error;
    }
  }

  @Get('me')
  @ApiSuccess('User profile retrieved successfully')
  async me(
    @User() user: AuthRequestUser,
    @Headers('x-auth-context') authContext: string | undefined,
  ) {
    this.assertUserMatchesAuthContext(
      user,
      this.resolveAuthContext(authContext),
    );

    const profile = await this.usersService.findAuthProfileById(user.id);
    if (!profile) {
      throw new NotFoundError('User not found');
    }

    return this.toAuthUser(profile.id);
  }

  @Patch('me')
  @ApiSuccess('User profile updated successfully')
  async updateProfile(
    @User() user: AuthRequestUser,
    @Headers('x-auth-context') authContext: string | undefined,
    @Body() dto: UpdateProfileDto,
  ) {
    this.assertUserMatchesAuthContext(
      user,
      this.resolveAuthContext(authContext),
    );
    await this.assertProfileIsUnique(user.id, dto);

    await this.usersService.update(user.id, dto);
    return this.toAuthUser(user.id);
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiSuccess('User avatar updated successfully')
  async updateAvatar(
    @User() user: AuthRequestUser,
    @Headers('x-auth-context') authContext: string | undefined,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.assertUserMatchesAuthContext(
      user,
      this.resolveAuthContext(authContext),
    );

    if (!file) {
      throw new BadRequestError('Avatar file is required');
    }

    const previousAvatarUrl = user.avatar_url;
    const asset = await this.assetsService.uploadFile(user, file, {
      folder: 'avatars',
      type: 'IMAGE',
      accessType: AssetAccessTypeDto.PUBLIC,
      entityId: user.id,
      entityType: 'user',
    });
    await this.usersService.update(user.id, {
      avatar_url: asset.url,
    });

    if (previousAvatarUrl && previousAvatarUrl !== asset.url) {
      await this.assetsService.removeEntityAssetByUrl(
        previousAvatarUrl,
        { id: user.id, type: 'user' },
        {
          folder: 'avatars',
          types: [asset_type.IMAGE],
        },
      );
    }

    return this.toAuthUser(user.id);
  }

  @Patch('change-password')
  @ApiSuccess('Password changed successfully')
  async changePassword(
    @User() user: AuthRequestUser,
    @Body() dto: ChangePasswordDto,
    @Headers('x-auth-context') authContext: string | undefined,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const context = this.resolveAuthContext(authContext);
    this.assertUserMatchesAuthContext(user, context);

    const { success } = await this.changePasswordUseCase.execute(user.id, dto);
    if (success) {
      this.clearRefreshCookies(res, context);
    }
  }

  @Public()
  @Post('logout')
  @ApiSuccess('Logged out successfully')
  logout(
    @Headers('x-auth-context') authContext: string | undefined,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    this.clearRefreshCookies(res, this.resolveAuthContext(authContext));
  }

  @Public()
  @Post('verify')
  @ApiSuccess('Account verified successfully')
  async verify(@Body() body: VerifyEmailDto) {
    await this.verifyAccountUseCase.execute(body);
  }

  @Public()
  @Post('forgot-password')
  @ApiSuccess('If your email is in our system, you will receive a reset code.')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const sessionId = await this.forgotPasswordUseCase.execute(dto);
    return { sessionId };
  }

  @Public()
  @Post('reset-password')
  @ApiSuccess('Your password has been reset successfully.')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute(dto);
  }

  @Public()
  @Post('resend-verification')
  @ApiSuccess('Verification code resent successfully.')
  async resendVerification(@Body('sessionId') sessionId: string) {
    await this.resendVerificationUseCase.execute({ sessionId });
  }

  @Public()
  @Post('request-verification')
  @ApiSuccess(
    'If your account exists and is unverified, you will receive a verification code.',
  )
  async requestVerification(@Body() dto: RequestVerificationDto) {
    return await this.requestVerificationUseCase.execute(dto);
  }

  private async assertProfileIsUnique(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<void> {
    if (dto.email) {
      const existingEmail = await this.usersService.findByEmail(dto.email);
      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictError('An account with this email already exists');
      }
    }

    if (dto.username) {
      const existingUsername = await this.usersService.findByUsername(
        dto.username,
      );
      if (existingUsername && existingUsername.id !== userId) {
        throw new ConflictError('Username is already taken');
      }
    }

    if (dto.phone) {
      const existingPhone = await this.usersService.findByPhone(dto.phone);
      if (existingPhone && existingPhone.id !== userId) {
        throw new ConflictError('Phone number is already taken');
      }
    }
  }

  private async toAuthUser(userId: string) {
    const user = await this.usersService.findAuthProfileById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const permissions = await this.permissionService.getEffectivePermissions(
      user.id,
      user.role,
    );

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: normalizeUserRole(user.role),
      permissions,
      status: user.status,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  private resolveAuthContext(authContext?: string): 'client' | 'admin' {
    return authContext === 'admin' ? 'admin' : 'client';
  }

  private getRefreshCookieNames(context: 'client' | 'admin') {
    return context === 'admin'
      ? { refreshToken: 'admin_refresh_token', refreshFlag: 'admin_has_rt' }
      : { refreshToken: 'client_refresh_token', refreshFlag: 'client_has_rt' };
  }

  private getRequiredRoles(context: 'client' | 'admin'): user_role[] {
    return context === 'admin'
      ? [user_role.ADMIN, user_role.MODERATOR]
      : [user_role.CUSTOMER];
  }

  private assertUserMatchesAuthContext(
    user: AuthRequestUser,
    context: 'client' | 'admin',
  ): void {
    if (!this.getRequiredRoles(context).includes(user.role)) {
      throw new UnauthorizedError('Invalid session for this app');
    }
  }

  private setRefreshCookies(
    res: express.Response,
    context: 'client' | 'admin',
    refreshToken: string,
  ) {
    const cookieNames = this.getRefreshCookieNames(context);
    this.clearPartitionedRefreshCookies(res, context);

    res.cookie(cookieNames.refreshToken, refreshToken, {
      httpOnly: this.configCookie.httpOnly,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      maxAge: this.configCookie.maxAge,
      partitioned: this.configCookie.partitioned,
    });
    res.cookie(cookieNames.refreshFlag, '1', {
      httpOnly: false,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      maxAge: this.configCookie.maxAge,
    });

    this.clearLegacyRefreshCookies(res);
  }

  private clearPartitionedRefreshCookies(
    res: express.Response,
    context: 'client' | 'admin',
  ) {
    const cookieNames = this.getRefreshCookieNames(context);

    res.clearCookie(cookieNames.refreshToken, {
      httpOnly: this.configCookie.httpOnly,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      partitioned: true,
    });
    res.clearCookie(cookieNames.refreshFlag, {
      httpOnly: false,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      partitioned: true,
    });
  }

  private clearRefreshCookies(
    res: express.Response,
    context: 'client' | 'admin',
  ) {
    const cookieNames = this.getRefreshCookieNames(context);

    res.clearCookie(cookieNames.refreshToken, {
      httpOnly: this.configCookie.httpOnly,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      partitioned: this.configCookie.partitioned,
    });
    res.clearCookie(cookieNames.refreshFlag, {
      httpOnly: false,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
    });

    this.clearLegacyRefreshCookies(res);
  }

  private clearLegacyRefreshCookies(res: express.Response) {
    res.clearCookie('refresh_token', {
      httpOnly: this.configCookie.httpOnly,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      partitioned: this.configCookie.partitioned,
    });
    res.clearCookie('has_rt', {
      httpOnly: false,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
    });
  }
}
