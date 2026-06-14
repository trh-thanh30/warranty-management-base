import { cookieConfig } from '@/config';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { User } from '@prisma/client';
import * as Sentry from '@sentry/nestjs';
import { NextFunction, Request, Response } from 'express';
import { validate as isUuid, v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdentityMiddleware implements NestMiddleware {
  constructor(
    @Inject(cookieConfig.KEY)
    private readonly configCookie: ConfigType<typeof cookieConfig>,
    private readonly tokenService: AuthTokenService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    let guestId =
      typeof req.cookies?.guest_id === 'string'
        ? req.cookies.guest_id
        : undefined;
    let user = req.user;

    // 1. Manually resolve user from JWT if not already set (since middleware runs before guards)
    if (!user) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const decoded = this.tokenService.verifyAccessToken(token);
          user = decoded.payload as unknown as User;
          req.user = user; // Set it for later use in guards/controllers
          this.setSentryUser(user);
        } catch {
          // Invalid or expired token, treat as guest
          Sentry.setUser(null);
        }
      } else {
        Sentry.setUser(null);
      }
    } else {
      this.setSentryUser(user);
    }

    // 2. Resolve or Create Guest ID if not present or invalid
    const isGuestIdValid = guestId && isUuid(guestId);
    if (!isGuestIdValid) {
      guestId = uuidv4();
      res.cookie('guest_id', guestId, {
        httpOnly: this.configCookie.httpOnly,
        secure: this.configCookie.secure,
        sameSite: this.configCookie.sameSite,
        maxAge: this.configCookie.maxAge,
        path: this.configCookie.path,
        domain: this.configCookie.domain,
        partitioned: this.configCookie.partitioned,
      });
    }
    const resolvedGuestId = guestId!;
    req.guestId = resolvedGuestId;

    next();
  }

  private setSentryUser(user?: Pick<User, 'id' | 'email' | 'username'> | null) {
    if (!user?.id) {
      Sentry.setUser(null);
      return;
    }

    Sentry.setUser({
      id: String(user.id),
      email: user.email,
      username: user.username,
    });
  }
}
