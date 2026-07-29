"use client";

import type { CSSProperties, ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button, cn } from "@repo/ui";

type SortableConfigItemProps = {
  children: ReactNode;
  className?: string;
  disabled: boolean;
  handleClassName?: string;
  id: string;
  label: string;
};

export function SortableConfigItem({
  children,
  className,
  disabled,
  handleClassName,
  id,
  label,
}: SortableConfigItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ disabled, id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] gap-2 motion-reduce:!transition-none",
        isDragging && "relative z-20 opacity-80 drop-shadow-xl",
        className,
      )}
      ref={setNodeRef}
      style={style}
    >
      <Button
        {...attributes}
        {...listeners}
        aria-label={label}
        className={cn(
          "mt-3 size-11 cursor-grab touch-none text-slate-500 active:cursor-grabbing disabled:cursor-not-allowed dark:text-slate-400",
          handleClassName,
        )}
        disabled={disabled}
        ref={setActivatorNodeRef}
        title={label}
        type="button"
        variant="ghost"
      >
        <GripVertical aria-hidden="true" className="size-5" />
      </Button>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
