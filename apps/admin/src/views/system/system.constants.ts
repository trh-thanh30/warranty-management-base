import { Activity, Cpu, Database } from "lucide-react";
import type { ServiceCheckSummary } from "@repo/shared";

export const services: ServiceCheckSummary[] = [
  {
    latency: "24ms",
    name: "API",
    status: "Healthy",
    target: "http://localhost:3000/health",
  },
  {
    latency: "8ms",
    name: "PostgreSQL",
    status: "Healthy",
    target: "booking-db:5432",
  },
  {
    latency: "3ms",
    name: "Redis",
    status: "Healthy",
    target: "booking-redis:6379",
  },
  {
    latency: "N/A",
    name: "Worker",
    status: "Pending",
    target: "queue worker",
  },
];

export const systemStats = [
  {
    description: "API availability",
    icon: Activity,
    title: "Uptime",
    trend: "Stable",
    value: "99.9%",
  },
  {
    description: "Database and cache",
    icon: Database,
    title: "Data services",
    trend: "2/2",
    value: "Online",
  },
  {
    description: "Queue worker template",
    icon: Cpu,
    title: "Background jobs",
    trend: "Mock",
    value: "Ready",
  },
];

export const connectivityNotes = [
  "Environment variables loaded",
  "Docker compose services named consistently",
  "CI Telegram notification configured",
];
