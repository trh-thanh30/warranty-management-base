"use client";

import { useQuery } from "@tanstack/react-query";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { usersService } from "@/src/services/users/users.service";

type StaffAccountDetailOptions =
  | {
      mode: "create";
      userId?: never;
    }
  | {
      mode: "edit";
      userId: string;
    };

export function useStaffAccountDetail({
  mode,
  userId,
}: StaffAccountDetailOptions) {
  const { user: currentUser } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const isEditing = mode === "edit";
  const editUserId = isEditing ? userId : null;
  const canLoadStaffDetail =
    Boolean(currentUser) &&
    hasRole("admin") &&
    hasPermission(PERMISSIONS.USER_UPDATE);

  const userQuery = useQuery({
    queryKey: ["staff", "detail", editUserId],
    queryFn: () => usersService.getModerator(editUserId ?? ""),
    enabled: canLoadStaffDetail && editUserId !== null,
  });

  return {
    formUser: isEditing ? (userQuery.data ?? null) : null,
    isEditing,
    userQuery,
  };
}
