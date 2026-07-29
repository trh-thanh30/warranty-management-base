"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  ContactSubmissionResponse,
  ContactSubmissionStatus,
  ListContactSubmissionsQuery,
  ListContactSubmissionsResponse,
} from "@repo/shared";
import { contactSubmissionsService } from "@/src/services/contact-submissions/contact-submissions.service";

export const contactSubmissionKeys = {
  all: ["contact-submissions"] as const,
  detail: (id: string | null) =>
    [...contactSubmissionKeys.details(), id] as const,
  details: () => [...contactSubmissionKeys.all, "detail"] as const,
  list: (query: ListContactSubmissionsQuery) =>
    [...contactSubmissionKeys.lists(), query] as const,
  lists: () => [...contactSubmissionKeys.all, "list"] as const,
};

export function useContactSubmissions(
  query: ListContactSubmissionsQuery,
  options?: Pick<UseQueryOptions<ListContactSubmissionsResponse>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: contactSubmissionKeys.list(query),
    queryFn: () => contactSubmissionsService.listContactSubmissions(query),
    placeholderData: keepPreviousData,
  });
}

export function useContactSubmission(
  id: string | null,
  options?: Pick<UseQueryOptions<ContactSubmissionResponse>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: contactSubmissionKeys.detail(id),
    queryFn: () => contactSubmissionsService.getContactSubmission(id ?? ""),
  });
}

export function useUpdateContactSubmissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ContactSubmissionStatus;
    }) =>
      contactSubmissionsService.updateContactSubmissionStatus(id, { status }),
    onSuccess: (submission) => {
      void queryClient.invalidateQueries({
        queryKey: contactSubmissionKeys.lists(),
      });
      queryClient.setQueryData(
        contactSubmissionKeys.detail(submission.id),
        submission,
      );
    },
  });
}
