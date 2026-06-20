import React from "react";

export const AutoFixersIcon = () => (
  <svg
    className="h-6 w-6 sm:h-7 sm:w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12.5V16c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M18.5 12.5l2.5-2.5a2 2 0 0 0-2.8-2.8l-2.5 2.5" />
    <path d="M15.5 15.5l-4.5 4.5a1.5 1.5 0 0 1-2.1-2.1l4.5-4.5" />
  </svg>
);

export const MechanicMastersIcon = () => (
  <svg
    className="h-6 w-6 sm:h-7 sm:w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v4M12 18v4" />
    <path d="M9 6h6" />
    <path d="M9 18h6" />
    <path d="M12 6c1.5 0 3 .5 3 1.5S13.5 9 12 9s-3 .5-3 1.5S10.5 12 12 12s3 .5 3 1.5-1.5 1.5-3 1.5-3 .5-3 1.5 1.5 1.5 3 1.5" />
  </svg>
);

export const PaintWorkshopIcon = () => (
  <svg
    className="h-6 w-6 sm:h-7 sm:w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 3h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M10 7v5h4V7" />
    <path d="M12 12v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-4" />
    <path d="M14 15h3a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2" />
    <circle cx="19" cy="11" r="0.8" fill="currentColor" />
    <circle cx="21" cy="13" r="0.8" fill="currentColor" />
    <circle cx="22" cy="10" r="0.8" fill="currentColor" />
  </svg>
);

export const PrecisionAutoIcon = () => (
  <svg
    className="h-6 w-6 sm:h-7 sm:w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <path d="M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
  </svg>
);

export const DriveInGarageIcon = () => (
  <svg
    className="h-6 w-6 sm:h-7 sm:w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 10V21a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V10" />
    <path d="M1 10l11-8 11 8" />
    <path d="M6 22V12h12v10" />
  </svg>
);

export const ProEquipmentsIcon = () => (
  <svg
    className="h-6 w-6 sm:h-7 sm:w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 12.3a3 3 0 0 0-4-4L4 15l2 2 6.7-6.7a3 3 0 0 0 2 2z" />
    <path d="M17 3l4 4-2.5 2.5a3 3 0 0 1-4.2-4.2L17 3z" />
    <path d="M6 18l-3 3M18 6l3-3" />
    <path d="M15 15l-6-6" />
  </svg>
);

export const solutionsIcons = {
  "auto-fixers": <AutoFixersIcon />,
  "mechanic-masters": <MechanicMastersIcon />,
  "paint-workshop": <PaintWorkshopIcon />,
  "precision-auto": <PrecisionAutoIcon />,
  "drive-in-garage": <DriveInGarageIcon />,
  "pro-equipments": <ProEquipmentsIcon />,
} as const;
