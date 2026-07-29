import type { PublicNetworkLocation } from "@repo/shared";

export type DealerLocation = PublicNetworkLocation & {
  kind: "DEALER";
};

export type NearbyDealerStatus =
  | "idle"
  | "loading"
  | "active"
  | "error"
  | "unsupported";
