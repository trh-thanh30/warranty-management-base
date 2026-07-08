export type ServiceCenterSummary = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  province: string;
  district: string | null;
  address: string;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};
