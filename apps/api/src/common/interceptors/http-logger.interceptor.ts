import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { LoggerService } from '@/common/logger/logger.service';
import { CONTEXT_LOGGER_TOKEN } from '@/common/logger/logger.token';
import { RequestMeta } from '@/common/types/request.type';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class HttpLogInterceptor implements NestInterceptor {
  private readonly MAX_TEXT =
    process.env.NODE_ENV === 'production' ? 512 : 4096;
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly SENSITIVE_FIELDS_BODY = [
    'password',
    'password_confirmation',
    'token',
    'access_token',
    'refresh_token',
    'secret',
    'apiKey',
    'api_key',
    'key',
    'authorization',
  ];
  private readonly SENSITIVE_FIELDS_HEADERS = [
    'authorization',
    'cookie',
    'set-cookie',
    'session',
    'user',
    'token',
    'access_token',
    'refresh_token',
    'secret',
    'apiKey',
    'api_key',
    'key',
  ];
  constructor(
    @Inject(CONTEXT_LOGGER_TOKEN('HTTP'))
    private readonly logger: LoggerService,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const http = ctx.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const start = performance.now();
    const requestId = this.generateRequestId();

    // Attach request ID to request object for use in other parts of the app
    req.requestId = requestId;

    return next.handle().pipe(
      tap((data) => {
        const ms = performance.now() - start;
        const durationMs = Number(ms.toFixed(2));
        const requestMeta = this.getRequestMeta(req, res, requestId);

        this.logger.info(`Response sent`, {
          ...requestMeta,
          duration_ms: durationMs,
          durationMs: `${durationMs}ms`,
          responseSize: this.getApproximateSize(data),
        });
      }),
      catchError((error) => {
        const ms = performance.now() - start;
        const durationMs = Number(ms.toFixed(2));
        const requestMeta = this.getRequestMeta(req, res, requestId, true);

        this.logger.error(`Request failed ${error.message}`, {
          ...requestMeta,
          statusCode: error.statusCode || error.status || 500,
          error: error.message,
          duration_ms: durationMs,
          durationMs: `${durationMs}ms`,
        });

        throw error;
      }),
    );
  }

  private generateRequestId(): string {
    // Generate a simple unique ID
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private sanitizeObject(value: any, sensitiveFields: string[]): any {
    if (!value || typeof value !== 'object') return value;

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeObject(item, sensitiveFields));
    }

    const sanitized = { ...value };

    for (const key of Object.keys(sanitized)) {
      const normalizedKey = key.toLowerCase();
      const isSensitive = sensitiveFields.some((field) =>
        normalizedKey.includes(field.toLowerCase()),
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (sanitized[key] && typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeObject(sanitized[key], sensitiveFields);
      }
    }

    return sanitized;
  }

  private sanitizeBody(body: any): any {
    return this.sanitizeObject(body, this.SENSITIVE_FIELDS_BODY);
  }

  private sanitizeHeaders(headers: any): any {
    return this.sanitizeObject(headers, this.SENSITIVE_FIELDS_HEADERS);
  }

  private getCookieNames(cookies: any): string[] {
    if (!cookies || typeof cookies !== 'object') return [];
    return Object.keys(cookies);
  }

  private getUserMeta(user: any) {
    if (!user || typeof user !== 'object') return {};

    return {
      userId: user.id,
      userRole: user.role,
    };
  }

  private getApproximateSize(data: any): string {
    if (!data) return '0B';

    try {
      const jsonString = JSON.stringify(data);
      const bytes = new TextEncoder().encode(jsonString).length;

      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)}KB`;
      return `${(bytes / 1048576).toFixed(2)}MB`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return 'unknown';
    }
  }

  private maybeTruncate(v: any) {
    try {
      const s = typeof v === 'string' ? v : JSON.stringify(v);
      return s.length > this.MAX_TEXT
        ? s.slice(0, this.MAX_TEXT) + '…[truncated]'
        : s;
    } catch {
      return '[Unserializable]';
    }
  }

  protected getRequestMeta(
    request: Request,
    response: Response,
    requestId: string,
    includeDebugPayload = false,
  ): RequestMeta {
    const safeHeaders = this.sanitizeHeaders({
      origin: request.headers.origin,
      referer: request.headers.referer,
      'x-auth-context': request.headers['x-auth-context'],
      'x-forwarded-for': request.headers['x-forwarded-for'],
      'x-real-ip': request.headers['x-real-ip'],
    });
    const userMeta = this.getUserMeta(request.user);
    const requestMeta: RequestMeta = {
      requestId,
      method: request.method,
      url: request.url,
      ip: request.ip || 'unknown',
      userAgent: request.get('user-agent') || 'unknown',
      userId: userMeta.userId,
      userRole: userMeta.userRole,
      headers: this.maybeTruncate(safeHeaders),
      cookieNames: this.getCookieNames(request.cookies || {}),
      query:
        includeDebugPayload || !this.isProduction
          ? this.maybeTruncate(request.query || {})
          : undefined,
      params:
        includeDebugPayload || !this.isProduction
          ? this.maybeTruncate(request.params || {})
          : undefined,
      body:
        includeDebugPayload || !this.isProduction
          ? this.maybeTruncate(this.sanitizeBody(request.body || {}))
          : undefined,
      cookies: undefined,
      session: undefined,
      user: undefined,
      statusCode: response.statusCode,
      durationMs: '0ms',
      duration_ms: 0,
      responseSize: '0B',
    };
    return requestMeta;
  }
}
