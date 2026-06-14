import type { BookingSummary } from "@repo/shared";
import type { BookingStatusFilter } from "@/src/views/bookings/bookings.types";

export const bookingStatusFilters: BookingStatusFilter[] = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export const bookings: BookingSummary[] = [
  {
    id: "BK-1008",
    customer: "Alpha Studio",
    date: "2026-06-04",
    location: "District 1",
    owner: "Minh Tran",
    status: "confirmed",
    total: "$1,240",
  },
  {
    id: "BK-1007",
    customer: "Northwind Team",
    date: "2026-06-05",
    location: "Thu Duc",
    owner: "Lan Nguyen",
    status: "pending",
    total: "$860",
  },
  {
    id: "BK-1006",
    customer: "Beacon Labs",
    date: "2026-06-07",
    location: "District 3",
    owner: "An Pham",
    status: "completed",
    total: "$2,100",
  },
  {
    id: "BK-1005",
    customer: "Orbit Works",
    date: "2026-06-08",
    location: "Binh Thanh",
    owner: "Minh Tran",
    status: "cancelled",
    total: "$430",
  },
];
