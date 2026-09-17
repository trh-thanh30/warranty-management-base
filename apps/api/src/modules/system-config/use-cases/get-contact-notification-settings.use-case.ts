import { ContactNotificationSettingsService } from '@/modules/system-config/services/contact-notification-settings.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetContactNotificationSettingsUseCase {
  constructor(
    private readonly settingsService: ContactNotificationSettingsService,
  ) {}

  execute() {
    return this.settingsService.get();
  }
}
