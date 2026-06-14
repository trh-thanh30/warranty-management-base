export type ServiceStatus = "Healthy" | "Pending";

export type ServiceCheckSummary = {
  latency: string;
  name: string;
  status: ServiceStatus;
  target: string;
};
