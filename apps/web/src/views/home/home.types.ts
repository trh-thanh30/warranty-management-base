export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  quote: string;
  carModel: string;
  claimAmount: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface WarrantyDetails {
  vehicleName: string;
  vin: string;
  licensePlate: string;
  planName: string;
  status: "Active" | "Expired" | "Pending";
  startDate: string;
  endDate: string;
  claimLimit: string;
  claimsUsed: string;
  remainingLimit: string;
  daysRemaining: number;
  progressPercent: number;
  coverageScope: string[];
}

export interface MockWarrantyRecord {
  details: WarrantyDetails;
  ownerPhone: string;
  ownerEmail: string;
}
