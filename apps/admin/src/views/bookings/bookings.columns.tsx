import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import type { BookingSummary } from "@repo/shared";
import { BookingStatusBadge } from "@/src/views/bookings/components/booking-status-badge";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function getBookingColumns(t: Translate): ColumnDef<BookingSummary>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label={t("selectAll")}
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(Boolean(value))
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={t("selectBooking", { id: row.original.id })}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "id",
      header: t("booking"),
      cell: ({ row }) => (
        <span className="font-medium text-slate-950 dark:text-slate-50">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: t("customer"),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {row.original.customer}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {row.original.location}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: t("date"),
    },
    {
      accessorKey: "owner",
      header: t("owner"),
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => <BookingStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "total",
      header: t("total"),
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-slate-950 dark:text-slate-50">
          {row.original.total}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={t("openActions", { id: row.original.id })}
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t("viewBooking")}</DropdownMenuItem>
            <DropdownMenuItem>{t("assignOwner")}</DropdownMenuItem>
            <DropdownMenuItem>{t("sendConfirmation")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
    },
  ];
}
