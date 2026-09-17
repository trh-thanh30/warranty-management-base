import { BadRequestError } from '@/common/response/client-errors';
import publicAbuseConfig, {
  type PublicAbuseConfig,
} from '@/config/public-abuse.config';
import { Inject, Injectable } from '@nestjs/common';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type TurnstileVerificationInput = {
  ip: string;
  token?: string;
};

type TurnstileVerificationResponse = {
  success?: boolean;
};

@Injectable()
export class TurnstileVerificationService {
  constructor(
    @Inject(publicAbuseConfig.KEY)
    private readonly config: PublicAbuseConfig,
  ) {}

  async verify({ ip, token }: TurnstileVerificationInput): Promise<void> {
    if (!this.config.turnstileSecretKey) return;

    if (!token?.trim() || token.length > 2048) {
      throw new BadRequestError(
        'Human verification is required',
        'TURNSTILE_TOKEN_REQUIRED',
      );
    }

    let result: TurnstileVerificationResponse;
    try {
      const response = await fetch(TURNSTILE_VERIFY_URL, {
        body: new URLSearchParams({
          secret: this.config.turnstileSecretKey,
          response: token,
          remoteip: ip,
        }),
        method: 'POST',
        signal: AbortSignal.timeout(5_000),
      });
      result = (await response.json()) as TurnstileVerificationResponse;
    } catch {
      throw new BadRequestError(
        'Human verification could not be completed',
        'TURNSTILE_VERIFICATION_UNAVAILABLE',
      );
    }

    if (!result.success) {
      throw new BadRequestError(
        'Human verification failed',
        'TURNSTILE_VERIFICATION_FAILED',
      );
    }
  }
}
