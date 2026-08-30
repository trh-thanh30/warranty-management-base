import { InternalServerError } from '@/common/response';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from 'node:crypto';

@Injectable()
export class ActivationCodeCryptoService {
  constructor(private readonly configService: ConfigService) {}

  hash(code: string): string {
    return createHmac('sha256', this.getSecret())
      .update(this.normalize(code))
      .digest('hex');
  }

  encrypt(code: string): string {
    const key = this.getEncryptionKey();
    const iv = randomBytes(this.getIvBytes());
    const cipher = createCipheriv(this.getAlgorithm(), key, iv);
    const encrypted = Buffer.concat([
      cipher.update(this.normalize(code), 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [iv, authTag, encrypted]
      .map((part) => part.toString('base64url'))
      .join('.');
  }

  decrypt(ciphertext: string): string {
    const parts = ciphertext.split('.');
    if (parts.length !== 3) {
      throw new InternalServerError(
        'Stored activation code is invalid',
        'ACTIVATION_CODE_CIPHERTEXT_INVALID',
      );
    }
    const [ivPart, authTagPart, encryptedPart] = parts as [
      string,
      string,
      string,
    ];
    try {
      const decipher = createDecipheriv(
        this.getAlgorithm(),
        this.getEncryptionKey(),
        Buffer.from(ivPart, 'base64url'),
      );
      decipher.setAuthTag(Buffer.from(authTagPart, 'base64url'));
      return Buffer.concat([
        decipher.update(Buffer.from(encryptedPart, 'base64url')),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new InternalServerError(
        'Stored activation code cannot be decrypted',
        'ACTIVATION_CODE_DECRYPTION_FAILED',
      );
    }
  }

  private normalize(code: string): string {
    return code.trim().toUpperCase();
  }

  private getEncryptionKey(): Buffer {
    return createHash('sha256').update(this.getSecret()).digest();
  }

  private getSecret(): string {
    const secret = this.configService.get<string>('activationCode.secret');
    if (!secret || secret.length < 32) {
      throw new InternalServerError(
        'Activation code encryption is not configured',
        'ACTIVATION_CODE_SECRET_MISSING',
      );
    }
    return secret;
  }

  private getAlgorithm(): 'aes-256-gcm' {
    const algorithm = this.configService.get<string>(
      'activationCode.algorithm',
    );
    if (algorithm !== 'aes-256-gcm') {
      throw new InternalServerError(
        'Activation code algorithm is invalid',
        'ACTIVATION_CODE_ALGORITHM_INVALID',
      );
    }
    return algorithm;
  }

  private getIvBytes(): number {
    const ivBytes = this.configService.get<number>('activationCode.ivBytes');
    if (!ivBytes || ivBytes < 12 || ivBytes > 32) {
      throw new InternalServerError(
        'Activation code IV length is invalid',
        'ACTIVATION_CODE_IV_BYTES_INVALID',
      );
    }
    return ivBytes;
  }
}
