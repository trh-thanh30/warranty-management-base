import { ContactNotificationSettingsService } from '@/modules/system-config/services/contact-notification-settings.service';
import { SystemConfigRepository } from '@/modules/system-config/repository/system-config.repository';

describe('ContactNotificationSettingsService', () => {
  const repository = { findByKey: jest.fn(), upsert: jest.fn() };
  const service = new ContactNotificationSettingsService(
    repository as unknown as SystemConfigRepository,
  );

  beforeEach(() => jest.clearAllMocks());

  it('uses admin@lexzenz.vn when no address has been configured', async () => {
    repository.findByKey.mockResolvedValue(null);
    await expect(service.get()).resolves.toEqual({ email: 'admin@lexzenz.vn' });
  });

  it('falls back to the default if the stored value is invalid', async () => {
    repository.findByKey.mockResolvedValue({ value: { email: 'invalid' } });
    await expect(service.get()).resolves.toEqual({ email: 'admin@lexzenz.vn' });
  });

  it('returns and updates the private notification address', async () => {
    repository.findByKey.mockResolvedValue({
      value: { email: 'team@example.com' },
    });
    repository.upsert.mockResolvedValue(undefined);
    await expect(service.get()).resolves.toEqual({ email: 'team@example.com' });
    await expect(
      service.update({ email: ' notify@example.com ' }, 'admin-id'),
    ).resolves.toEqual({ email: 'notify@example.com' });
    expect(repository.upsert).toHaveBeenCalledWith(
      'contact_notification_settings',
      { email: 'notify@example.com' },
      'admin-id',
    );
  });

  it('rejects an invalid address', async () => {
    await expect(
      service.update({ email: 'invalid' }, 'admin-id'),
    ).rejects.toMatchObject({ code: 'CONTACT_NOTIFICATION_EMAIL_INVALID' });
    expect(repository.upsert).not.toHaveBeenCalled();
  });
});
