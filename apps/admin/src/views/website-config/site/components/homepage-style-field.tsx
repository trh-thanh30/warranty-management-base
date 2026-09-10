"use client";

import type { WebsiteTextStyle } from "@repo/shared";

const options = {
  font: ["heading", "body"],
  size: ["s", "m", "l", "xl", "2xl"],
  color: ["default", "muted", "primary", "inverse"],
  align: ["left", "center", "right"],
} as const;

export function HomepageStyleField({
  labels,
  onChange,
  readOnly = false,
  value,
}: {
  labels: Record<
    "align" | "bold" | "color" | "font" | "italic" | "size",
    string
  >;
  onChange: (value: WebsiteTextStyle) => void;
  readOnly?: boolean;
  value: WebsiteTextStyle;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["font", "size", "color", "align"] as const).map((property) => (
        <select
          aria-label={labels[property]}
          className="h-9 rounded-md border bg-background px-2 text-sm"
          disabled={readOnly}
          key={property}
          onChange={(event) =>
            onChange({ ...value, [property]: event.target.value })
          }
          value={value[property]}
        >
          {options[property].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ))}
      <label className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        <input
          checked={value.bold}
          disabled={readOnly}
          onChange={(event) =>
            onChange({ ...value, bold: event.target.checked })
          }
          type="checkbox"
        />
        {labels.bold}
      </label>
      <label className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        <input
          checked={value.italic}
          disabled={readOnly}
          onChange={(event) =>
            onChange({ ...value, italic: event.target.checked })
          }
          type="checkbox"
        />
        {labels.italic}
      </label>
    </div>
  );
}
