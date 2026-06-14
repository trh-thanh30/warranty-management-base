import { useEffect } from "react";
import type { RefObject } from "react";

type ClickOutsideEvent = MouseEvent | TouchEvent | PointerEvent;

export type UseClickOutsideOptions = {
  disabled?: boolean;
  eventTypes?: Array<"mousedown" | "pointerdown" | "touchstart">;
};

const defaultEventTypes: NonNullable<UseClickOutsideOptions["eventTypes"]> = [
  "mousedown",
  "touchstart",
];

function isNode(value: unknown): value is Node {
  return typeof Node !== "undefined" && value instanceof Node;
}

export function useClickOutside<TElement extends HTMLElement>(
  ref: RefObject<TElement | null>,
  handler: (event: ClickOutsideEvent) => void,
  options: UseClickOutsideOptions = {},
) {
  const { disabled = false, eventTypes = defaultEventTypes } = options;

  useEffect(() => {
    if (disabled || typeof document === "undefined") {
      return undefined;
    }

    const listener = (event: ClickOutsideEvent) => {
      const element = ref.current;

      if (!element || !isNode(event.target) || element.contains(event.target)) {
        return;
      }

      handler(event);
    };

    eventTypes.forEach((eventType) => {
      document.addEventListener(eventType, listener);
    });

    return () => {
      eventTypes.forEach((eventType) => {
        document.removeEventListener(eventType, listener);
      });
    };
  }, [disabled, eventTypes, handler, ref]);
}
