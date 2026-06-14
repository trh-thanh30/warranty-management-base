export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

export type BookingSummary = {
  id: string;
  customer: string;
  date: string;
  location: string;
  owner: string;
  status: BookingStatus;
  total: string;
};
