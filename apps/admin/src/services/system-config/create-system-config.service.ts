import type {
  ActivationCodePolicy,
  ContactNotificationSettings,
  SystemConfigHttpClient,
} from "./system-config.types";
import { unwrap } from "../service.utils";

export function createSystemConfigService(http: SystemConfigHttpClient) {
  return {
    getActivationCodePolicy: () =>
      http
        .get<ActivationCodePolicy>("/system-config/activation-code-policy")
        .then(unwrap),
    updateActivationCodePolicy: (body: ActivationCodePolicy) =>
      http
        .post<ActivationCodePolicy>(
          "/system-config/activation-code-policy",
          body,
        )
        .then(unwrap),
    getContactNotificationSettings: () =>
      http
        .get<ContactNotificationSettings>(
          "/system-config/contact-notification-settings",
        )
        .then(unwrap),
    updateContactNotificationSettings: (body: ContactNotificationSettings) =>
      http
        .post<ContactNotificationSettings>(
          "/system-config/contact-notification-settings",
          body,
        )
        .then(unwrap),
  };
}
