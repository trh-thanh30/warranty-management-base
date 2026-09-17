import { UpdateContactNotificationSettingsDto } from '@/modules/system-config/dto/update-contact-notification-settings.dto';
import { ContactNotificationSettingsService } from '@/modules/system-config/services/contact-notification-settings.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateContactNotificationSettingsUseCase {
  constructor(
    private readonly settingsService: ContactNotificationSettingsService,
  ) {}

  execute(input: UpdateContactNotificationSettingsDto, actorId: string) {
    return this.settingsService.update(input, actorId);
  }
}
