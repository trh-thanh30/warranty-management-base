import type {
  WarrantyAdjustmentChange,
  WarrantyAdjustmentHistoryEntry,
  WarrantyAdjustmentValue,
  WarrantyAdjustmentActor,
} from "@repo/shared";

export function getWarrantyAdjustmentHistory(
  metadata: Record<string, unknown> | null,
): WarrantyAdjustmentHistoryEntry[] {
  if (!metadata) return [];

  if (Array.isArray(metadata.adjustmentHistory)) {
    return metadata.adjustmentHistory
      .map((entry) => normalizeEntry(entry))
      .filter(
        (entry): entry is WarrantyAdjustmentHistoryEntry =>
          entry !== null && entry.changedFields.length > 0,
      );
  }

  const legacyEntry = normalizeEntry(metadata.lastAdjustment);
  return legacyEntry ? [legacyEntry] : [];
}

function normalizeEntry(value: unknown): WarrantyAdjustmentHistoryEntry | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.reason !== "string" ||
    typeof value.adjustedAt !== "string" ||
    !Array.isArray(value.changedFields) ||
    !value.changedFields.every((field) => typeof field === "string") ||
    (value.adjustedByUserId !== null &&
      value.adjustedByUserId !== undefined &&
      typeof value.adjustedByUserId !== "string")
  ) {
    return null;
  }

  const changes = normalizeChanges(value.changes);
  const changedFields = value.changedFields.filter((field) => {
    const change = changes[field];
    return !change || change.before !== change.after;
  });

  return {
    adjustedAt: value.adjustedAt,
    adjustedByUserId:
      value.adjustedByUserId === undefined ? null : value.adjustedByUserId,
    adjustedByUser: normalizeActor(value.adjustedByUser),
    changedFields,
    changes,
    reason: stripHtml(value.reason),
  };
}

function normalizeActor(value: unknown): WarrantyAdjustmentActor | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.email !== "string" ||
    (value.name !== null &&
      value.name !== undefined &&
      typeof value.name !== "string")
  ) {
    return null;
  }

  return {
    id: value.id,
    email: value.email,
    name: value.name === undefined ? null : value.name,
  };
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeChanges(
  value: unknown,
): Record<string, WarrantyAdjustmentChange> {
  if (!isRecord(value)) return {};

  return Object.entries(value).reduce<Record<string, WarrantyAdjustmentChange>>(
    (changes, [field, change]) => {
      if (!isRecord(change)) return changes;
      if (
        !isAdjustmentValue(change.before) ||
        !isAdjustmentValue(change.after)
      ) {
        return changes;
      }

      changes[field] = {
        before: change.before,
        after: change.after,
      };
      return changes;
    },
    {},
  );
}

function isAdjustmentValue(value: unknown): value is WarrantyAdjustmentValue {
  return (
    value === null || typeof value === "string" || typeof value === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
