"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { UserAccountSummary } from "@repo/shared";
import {
  ROLE_DEFAULT_PERMISSIONS,
  type PermissionKey,
} from "@repo/shared/constants";
import { usersService } from "@/src/services/users.service";
import { useToast } from "@/src/hooks/use-toast";
import { buildModeratorPermissionOverrides } from "../staff.utils";
import { staffKeys } from "./use-staff";

export function useStaffPermissions({
  onOpenChange,
  open,
  user,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: UserAccountSummary | null;
}) {
  const t = useTranslations("Staff");
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<PermissionKey>>(new Set());
  const queryKey = staffKeys.permissions(user?.id ?? null);
  const permissionsQuery = useQuery({
    queryKey,
    queryFn: () => usersService.getPermissions(user!.id),
    enabled: open && Boolean(user),
  });
  const saveMutation = useMutation({
    mutationFn: (nextSelected: Set<PermissionKey>) =>
      usersService.updatePermissions(user!.id, {
        overrides: buildModeratorPermissionOverrides(nextSelected),
      }),
    onSuccess: (result) => {
      setSelected(new Set(result.effectivePermissions));
      void queryClient.invalidateQueries({ queryKey });
      toast.success(t("permissionsSaved"));
      onOpenChange(false);
    },
    onError: () => toast.error(t("permissionsSaveError")),
  });

  useEffect(() => {
    if (permissionsQuery.data) {
      setSelected(new Set(permissionsQuery.data.effectivePermissions));
    }
  }, [permissionsQuery.data]);

  function toggle(permission: PermissionKey, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(permission);
      else next.delete(permission);
      return next;
    });
  }

  function restoreDefaults() {
    setSelected(new Set(ROLE_DEFAULT_PERMISSIONS.moderator));
  }

  function save() {
    saveMutation.mutate(selected);
  }

  return {
    isSaving: saveMutation.isPending,
    permissionsQuery,
    restoreDefaults,
    save,
    selected,
    toggle,
  };
}
