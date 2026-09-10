import type { ElementType, ReactNode } from "react";
import type { WebsiteEditableText } from "@repo/shared";

const fontClasses = { heading: "font-heading", body: "font-sans" } as const;
const sizeClasses = {
  s: "text-sm",
  m: "text-base",
  l: "text-xl",
  xl: "text-3xl",
  "2xl": "text-5xl",
} as const;
const colorClasses = {
  default: "text-deep-black",
  muted: "text-stone-gray",
  primary: "text-premium-red",
  inverse: "text-white",
} as const;
const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

type EditableTextValue = Omit<WebsiteEditableText, "content"> & {
  content: ReactNode;
};

export function editableTextClassName(
  value: Omit<WebsiteEditableText, "content">,
) {
  return [
    fontClasses[value.font],
    sizeClasses[value.size],
    colorClasses[value.color],
    alignClasses[value.align],
    value.bold ? "font-bold" : "font-normal",
    value.italic ? "italic" : "not-italic",
  ].join(" ");
}

export function EditableText({
  as: Component = "span",
  className = "",
  value,
}: {
  as?: ElementType;
  className?: string;
  value: EditableTextValue;
}) {
  return (
    <Component
      className={`${editableTextClassName(value)} ${className}`.trim()}
    >
      {value.content}
    </Component>
  );
}
