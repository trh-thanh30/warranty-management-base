import { BadRequestError } from '@/common/response';
import { SystemConfigRepository } from '@/modules/system-config/repository/system-config.repository';
import type { ContactNotificationSettings } from '@repo/shared';
import { Injectable } from '@nestjs/common';
import { isEmail } from 'class-validator';

const SETTINGS_KEY = 'contact_notification_settings';
const DEFAULT_EMAIL = 'admin@lexzenz.vn';

@Injectable()
export class ContactNotificationSettingsService {
  constructor(private readonly repository: SystemConfigRepository) {}

  async get(): Promise<ContactNotificationSettings> {
    const stored = await this.repository.findByKey(SETTINGS_KEY);
    const value = stored?.value;
    const email =
      value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>).email
        : null;
    return {
      email:
        typeof email === 'string' && email.length <= 160 && isEmail(email)
          ? email
          : DEFAULT_EMAIL,
    };
  }

  async update(
    input: ContactNotificationSettings,
    updatedById: string,
  ): Promise<ContactNotificationSettings> {
    const email = input.email?.trim();
    if (!email || email.length > 160 || !isEmail(email)) {
      throw new BadRequestError(
        'Contact notification email is invalid',
        'CONTACT_NOTIFICATION_EMAIL_INVALID',
      );
    }
    const settings = { email };
    await this.repository.upsert(SETTINGS_KEY, settings, updatedById);
    return settings;
  }
}
