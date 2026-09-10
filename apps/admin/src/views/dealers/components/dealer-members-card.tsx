"use client";

import { SearchDropdown } from "@/src/components/common";
import {
  useAddDealerMember,
  useDealerMembers,
  useRemoveDealerMember,
} from "@/src/hooks/use-dealers";
import { useStaffMembers } from "@/src/views/staff/hooks/use-staff";
import type { DealerMembershipSummary, UserAccountSummary } from "@repo/shared";
import { formatDate } from "@repo/shared";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Label,
  Skeleton,
} from "@repo/ui";
import { Loader2, Plus, Trash2, UserRoundCog, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function DealerMembersCard({ dealerId }: { dealerId: string }) {
  const t = useTranslations("Dealers.members");
  const membersQuery = useDealerMembers(dealerId);
  const removeMember = useRemoveDealerMember(dealerId);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] =
    useState<DealerMembershipSummary | null>(null);

  async function remove() {
    if (!removeTarget) return;
    try {
      await removeMember.mutateAsync(removeTarget.id);
      toast.success(t("removed"));
      setRemoveTarget(null);
    } catch {
      toast.error(t("removeError"));
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription className="mt-1">
              {t("description")}
            </CardDescription>
          </div>
          <Button onClick={() => setAddOpen(true)} type="button">
            <Plus className="size-4" />
            {t("add")}
          </Button>
        </CardHeader>
        <CardContent>
          {membersQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton className="h-20 w-full" key={index} />
              ))}
            </div>
          ) : membersQuery.isError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {t("loadError")}
            </div>
          ) : membersQuery.data?.length ? (
            <div className="divide-y rounded-md border">
              {membersQuery.data.map((membership) => (
                <MemberRow
                  key={membership.id}
                  membership={membership}
                  onRemove={() => setRemoveTarget(membership)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-md border border-dashed px-5 py-10 text-center">
              <Users className="size-8 text-slate-400" />
              <p className="mt-3 font-medium">{t("emptyTitle")}</p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                {t("emptyDescription")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddDealerMemberDialog
        dealerId={dealerId}
        members={membersQuery.data ?? []}
        onOpenChange={setAddOpen}
        open={addOpen}
      />

      <Dialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <DialogContent>
          <div className="space-y-2">
            <DialogTitle>{t("removeTitle")}</DialogTitle>
            <DialogDescription>
              {t("removeDescription", {
                name:
                  removeTarget?.user.fullName ??
                  removeTarget?.user.username ??
                  "",
              })}
            </DialogDescription>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              disabled={removeMember.isPending}
              onClick={() => setRemoveTarget(null)}
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button
              disabled={removeMember.isPending}
              onClick={() => void remove()}
              type="button"
              variant="destructive"
            >
              {removeMember.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {t("confirmRemove")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MemberRow({
  membership,
  onRemove,
}: {
  membership: DealerMembershipSummary;
  onRemove: () => void;
}) {
  const t = useTranslations("Dealers.members");

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">
            {membership.user.fullName || membership.user.username}
          </p>
          <Badge
            variant={
              membership.user.status === "ACTIVE" ? "success" : "secondary"
            }
          >
            {t(`statuses.${membership.user.status}`)}
          </Badge>
        </div>
        <p className="mt-1 truncate text-sm text-slate-500">
          {membership.user.email}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {t("assignedMeta", {
            date: formatDate(membership.createdAt),
            name:
              membership.createdBy?.fullName ||
              membership.createdBy?.username ||
              t("system"),
          })}
        </p>
      </div>

      <Button
        aria-label={t("removeMember", {
          name: membership.user.fullName || membership.user.username,
        })}
        className="self-start text-red-600 hover:bg-red-50 hover:text-red-700 sm:self-center"
        onClick={onRemove}
        type="button"
        variant="ghost"
      >
        <Trash2 className="size-4" />
        <span className="sm:sr-only">{t("remove")}</span>
      </Button>
    </div>
  );
}

function AddDealerMemberDialog({
  dealerId,
  members,
  onOpenChange,
  open,
}: {
  dealerId: string;
  members: DealerMembershipSummary[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const t = useTranslations("Dealers.members");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserAccountSummary | null>(null);
  const staffQuery = useStaffMembers(
    { limit: 20, page: 1, search, status: "ACTIVE" },
    { enabled: open },
  );
  const addMember = useAddDealerMember(dealerId);
  const memberUserIds = useMemo(
    () => new Set(members.map((membership) => membership.userId)),
    [members],
  );

  function reset() {
    setSearch("");
    setSelected(null);
  }

  async function submit() {
    if (!selected) return;
    try {
      await addMember.mutateAsync({ userId: selected.id });
      toast.success(t("added"));
      reset();
      onOpenChange(false);
    } catch {
      toast.error(t("addError"));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <div className="space-y-2">
          <DialogTitle>{t("addTitle")}</DialogTitle>
          <DialogDescription>{t("addDescription")}</DialogDescription>
        </div>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dealer-member-search">{t("staffLabel")}</Label>
            <SearchDropdown
              emptyLabel={t("noStaff")}
              errorLabel={t("staffLoadError")}
              getItemDisabledReason={(item) =>
                memberUserIds.has(item.id) ? t("alreadyAssigned") : null
              }
              getItemKey={(item) => item.id}
              id="dealer-member-search"
              isError={staffQuery.isError}
              isLoading={staffQuery.isLoading}
              items={staffQuery.data?.items ?? []}
              loadingLabel={t("loadingStaff")}
              onItemSelect={(item) => {
                setSelected(item);
                setSearch("");
              }}
              onRetry={() => void staffQuery.refetch()}
              onSearchChange={(value) => {
                setSearch(value);
                if (selected) setSelected(null);
              }}
              placeholder={t("staffPlaceholder")}
              renderItem={(item) => <StaffOption item={item} />}
              retryLabel={t("retry")}
              searchValue={search}
              selectedLabel={
                selected ? selected.fullName || selected.username : undefined
              }
            />
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={addMember.isPending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="secondary"
          >
            {t("cancel")}
          </Button>
          <Button
            disabled={!selected || addMember.isPending}
            onClick={() => void submit()}
            type="button"
          >
            {addMember.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserRoundCog className="size-4" />
            )}
            {t("confirmAdd")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StaffOption({ item }: { item: UserAccountSummary }) {
  return (
    <span className="min-w-0">
      <span className="block truncate font-medium">
        {item.fullName || item.username}
      </span>
      <span className="block truncate text-xs text-slate-500">
        {item.email}
      </span>
    </span>
  );
}
