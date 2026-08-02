import type {
  AdminLoginChallengeResponse,
  AdminLoginStartResponse,
} from "@repo/shared";

export type LoginFlowState =
  | { step: "METHOD_SELECTION"; challenge: AdminLoginStartResponse }
  | { step: "VERIFICATION"; challenge: AdminLoginChallengeResponse }
  | null;
