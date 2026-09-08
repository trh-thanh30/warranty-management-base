import type {
  ActivationCodePolicy,
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
  };
}
