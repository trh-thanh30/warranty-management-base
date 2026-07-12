"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  ListUsersQuery,
  PaginatedResponse,
  UpdateModeratorBody,
  UserAccountSummary,
} from "@repo/shared";
import { usersService } from "@/src/services/users/users.service";

type StaffListQuery = Omit<ListUsersQuery, "role" | "roles">;

export const staffKeys = {
  all: ["staff"] as const,
  list: (query: StaffListQuery) => [...staffKeys.lists(), query] as const,
  lists: () => [...staffKeys.all, "list"] as const,
  permissions: (userId: string | null) =>
    [...staffKeys.all, "permissions", userId] as const,
};

export function useStaffMembers(
  query: StaffListQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<UserAccountSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    queryKey: staffKeys.list(query),
    queryFn: () => usersService.listModerators(query),
    ...options,
  });
}

export function useUpdateStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      body,
      userId,
    }: {
      body: UpdateModeratorBody;
      userId: string;
    }) => usersService.updateModerator(userId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}
