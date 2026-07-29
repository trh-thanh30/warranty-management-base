import type { Transition } from "framer-motion";

type CubicBezier = [number, number, number, number];

export const motionDuration = {
  instant: 0.12,
  fast: 0.18,
  normal: 0.28,
  reveal: 0.45,
  slow: 0.6,
} as const;

export const motionEase = {
  out: [0.22, 1, 0.36, 1] satisfies CubicBezier,
  standard: [0.4, 0, 0.2, 1] satisfies CubicBezier,
} as const;

export const motionSpring = {
  soft: { type: "spring", stiffness: 260, damping: 28 } satisfies Transition,
  snappy: { type: "spring", stiffness: 300, damping: 30 } satisfies Transition,
  tilt: { stiffness: 140, damping: 22 },
} as const;

export const revealViewportOnce = {
  once: true,
  margin: "0px 0px -80px 0px",
} as const;

export const revealViewportRepeat = {
  once: false,
  margin: "0px 0px -80px 0px",
} as const;
