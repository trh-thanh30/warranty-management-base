import type { AuthUser } from "@repo/shared";
import { PERMISSION_GROUPS, type PermissionKey } from "@repo/shared/constants";
import type { ProfileFormValues } from "./settings.types";

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export type AvatarValidationError = "avatarTypeError" | "avatarSizeError";

export type PermissionGroup = {
  key: string;
  permissions: string[];
};

export function validateAvatarFile(
  file: Pick<File, "size" | "type">,
): AvatarValidationError | null {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) return "avatarTypeError";
  if (file.size > MAX_AVATAR_SIZE_BYTES) return "avatarSizeError";
  return null;
}

export function getProfileFormValues(user: AuthUser): ProfileFormValues {
  return {
    fullName: user.full_name ?? "",
    phone: user.phone ?? "",
    username: user.username,
    email: user.email,
  };
}

export function groupPermissions(userPermissions: string[]): PermissionGroup[] {
  const userPermissionSet = new Set(userPermissions);
  const groups: PermissionGroup[] = PERMISSION_GROUPS.flatMap((group) => {
    const permissions = group.permissions.filter((permission) =>
      userPermissionSet.has(permission),
    );

    return permissions.length > 0 ? [{ key: group.key, permissions }] : [];
  });
  const knownPermissions = new Set<PermissionKey>(
    PERMISSION_GROUPS.flatMap((group) => [...group.permissions]),
  );
  const otherPermissions = userPermissions.filter(
    (permission) => !knownPermissions.has(permission as PermissionKey),
  );

  if (otherPermissions.length > 0) {
    groups.push({ key: "other", permissions: otherPermissions });
  }

  return groups;
}
