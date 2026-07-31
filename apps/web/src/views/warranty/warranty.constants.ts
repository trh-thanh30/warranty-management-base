import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { APP_ROUTES } from "@/src/constants/routes.constants";

export const warrantyActions = [
  {
    id: "lookup",
    kind: "link",
    icon: "search",
    href: APP_ROUTES.warrantyLookup,
  },
  ...(PUBLIC_FEATURES.warrantyActivation
    ? [
        {
          id: "activate" as const,
          kind: "link" as const,
          icon: "shield" as const,
          href: APP_ROUTES.warrantyActivate,
        },
      ]
    : []),
  {
    id: "request",
    kind: "link",
    icon: "file",
    href: APP_ROUTES.warrantyRequest,
  },
  {
    id: "track",
    kind: "link",
    icon: "clock",
    href: APP_ROUTES.warrantyTrack,
  },
  {
    id: "dealers",
    kind: "link",
    icon: "map",
    href: APP_ROUTES.dealers,
  },
  {
    id: "policy",
    kind: "link",
    icon: "help",
    href: APP_ROUTES.policyWarrantyReturn,
  },
] as const;

export const demoWarrantyRecord = {
  serial: "BL/BHDT/000199",
  code: "FJ-8899-2026",
  phone: "0988 123 456",
  address: "TP. Hồ Chí Minh",
  carPlate: "30H-888.88",
  carModel: "Lexus RX350 (2025)",
  filmType: "FUJITEK Sputtering Multi-Layer RF50",
  installedDate: "15/01/2026",
  expiryDate: "15/01/2041",
  windshield: "SP50",
  frontLeftGlass: "SP30",
  frontRightGlass: "SP30",
  rearLeftGlass: "SP30",
  rearRightGlass: "SP30",
  sunroof: "",
  rearGlass: "SP30",
  notes: "",
} as const;
