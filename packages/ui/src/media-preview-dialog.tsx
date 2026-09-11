"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { KeyboardEvent } from "react";

export type MediaPreviewItem = {
  alt: string;
  src: string;
  type?: "image" | "video";
};

export type MediaPreviewDialogProps = {
  activeIndex?: number;
  closeLabel: string;
  items: MediaPreviewItem[];
  nextLabel?: string;
  onActiveIndexChange?: (index: number) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  previousLabel?: string;
};

export function MediaPreviewDialog({
  activeIndex = 0,
  closeLabel,
  items,
  nextLabel,
  onActiveIndexChange,
  onOpenChange,
  open,
  previousLabel,
}: MediaPreviewDialogProps) {
  const normalizedIndex = Math.min(
    Math.max(activeIndex, 0),
    Math.max(items.length - 1, 0),
  );
  const currentItem = items[normalizedIndex];
  const hasNavigation =
    items.length > 1 && Boolean(previousLabel) && Boolean(nextLabel);

  function move(offset: number) {
    if (!hasNavigation) return;
    const nextIndex = (normalizedIndex + offset + items.length) % items.length;
    onActiveIndexChange?.(nextIndex);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  }

  return (
    <DialogPrimitive.Root
      onOpenChange={onOpenChange}
      open={open && Boolean(currentItem)}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:transition-none" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none sm:p-8"
          onKeyDown={handleKeyDown}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) onOpenChange(false);
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            {currentItem?.alt}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {normalizedIndex + 1} / {items.length}
          </DialogPrimitive.Description>

          {currentItem?.type === "video" ? (
            <video
              className="max-h-full max-w-full rounded-md bg-black object-contain"
              controls
              key={currentItem.src}
              playsInline
              src={currentItem.src}
            />
          ) : currentItem ? (
            <img
              alt={currentItem.alt}
              className="max-h-full max-w-full rounded-md object-contain duration-200 data-[state=open]:animate-in data-[state=open]:zoom-in-95 motion-reduce:transition-none"
              src={currentItem.src}
            />
          ) : null}

          {hasNavigation ? (
            <>
              <button
                aria-label={previousLabel}
                className="absolute left-3 flex size-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-200 hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-5"
                onClick={() => move(-1)}
                title={previousLabel}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-7" />
              </button>
              <button
                aria-label={nextLabel}
                className="absolute right-3 flex size-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-200 hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5"
                onClick={() => move(1)}
                title={nextLabel}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-7" />
              </button>
            </>
          ) : null}

          <DialogPrimitive.Close
            aria-label={closeLabel}
            className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-200 hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5 sm:top-5"
            title={closeLabel}
            type="button"
          >
            <X aria-hidden="true" className="size-7" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
