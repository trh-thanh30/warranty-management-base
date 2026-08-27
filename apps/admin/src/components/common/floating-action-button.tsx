"use client";

import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@repo/ui";

type FloatingActionButtonProps = {
  "aria-label": string;
  children: ReactNode;
  onClick: () => void;
  title: string;
};

type Position = { left: number; top: number };
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  moved: boolean;
};

const DRAG_THRESHOLD = 4;
const BUTTON_SIZE = 40;
const VIEWPORT_MARGIN = 16;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function getSnappedPosition(left: number, top: number) {
  const maxLeft = window.innerWidth - BUTTON_SIZE - VIEWPORT_MARGIN;
  const maxTop = window.innerHeight - BUTTON_SIZE - VIEWPORT_MARGIN;
  const nextLeft = clamp(left, VIEWPORT_MARGIN, maxLeft);
  const nextTop = clamp(top, VIEWPORT_MARGIN, maxTop);
  const distanceToLeft = nextLeft - VIEWPORT_MARGIN;
  const distanceToRight = maxLeft - nextLeft;

  return {
    left: distanceToLeft <= distanceToRight ? VIEWPORT_MARGIN : maxLeft,
    top: nextTop,
  };
}

export function FloatingActionButton({
  "aria-label": ariaLabel,
  children,
  onClick,
  title,
}: FloatingActionButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      if (dragRef.current || !buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      setPosition(getSnappedPosition(rect.left, rect.top));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

  const snapToNearestEdge = (left: number, top: number) => {
    setPosition(getSnappedPosition(left, top));
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 && event.pointerType !== "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;

    if (!drag.moved) setIsDragging(true);
    drag.moved = true;
    suppressClickRef.current = true;
    setPosition({
      left: clamp(
        drag.startLeft + deltaX,
        VIEWPORT_MARGIN,
        window.innerWidth - BUTTON_SIZE - VIEWPORT_MARGIN,
      ),
      top: clamp(
        drag.startTop + deltaY,
        VIEWPORT_MARGIN,
        window.innerHeight - BUTTON_SIZE - VIEWPORT_MARGIN,
      ),
    });
  };

  const releasePointer = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (drag.moved) {
      const rect = event.currentTarget.getBoundingClientRect();
      snapToNearestEdge(rect.left, rect.top);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      return;
    }
    onClick();
  };

  if (!mounted) return null;

  return createPortal(
    <Button
      aria-label={ariaLabel}
      ref={buttonRef}
      className={`fixed z-40 size-10 cursor-pointer touch-none rounded-full p-0 shadow-lg duration-200 hover:scale-105 hover:shadow-xl focus-visible:scale-105 ${
        isDragging ? "transition-none" : "transition-all"
      } ${position ? "" : "bottom-24 right-4 sm:bottom-8 sm:right-8"}`}
      onClick={handleClick}
      onPointerCancel={releasePointer}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={releasePointer}
      style={position ? { left: position.left, top: position.top } : undefined}
      title={title}
      type="button"
      variant="primary"
    >
      {children}
    </Button>,
    document.body,
  );
}
