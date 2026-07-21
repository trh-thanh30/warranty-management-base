import type {
  CreateServiceCenterBody,
  ListServiceCentersQuery,
  PaginatedResponse,
  ServiceCenterSummary,
  UpdateServiceCenterBody,
} from "@repo/shared";
import { unwrap } from "../service.utils.ts";
import type { ServiceCentersHttpClient } from "./service-centers.types";

export function createServiceCentersService(http: ServiceCentersHttpClient) {
  return {
    async listProvinces(): Promise<string[]> {
      return unwrap(await http.get<string[]>("/service-centers/provinces"));
    },

    async listServiceCenters(
      query: ListServiceCentersQuery,
    ): Promise<PaginatedResponse<ServiceCenterSummary>> {
      return unwrap(
        await http.get<PaginatedResponse<ServiceCenterSummary>>(
          "/service-centers",
          { params: query },
        ),
      );
    },

    async getServiceCenter(
      serviceCenterId: string,
    ): Promise<ServiceCenterSummary> {
      return unwrap(
        await http.get<ServiceCenterSummary>(
          `/service-centers/${serviceCenterId}`,
        ),
      );
    },

    async createServiceCenter(
      body: CreateServiceCenterBody,
    ): Promise<ServiceCenterSummary> {
      return unwrap(
        await http.post<ServiceCenterSummary>("/service-centers", body),
      );
    },

    async updateServiceCenter(
      serviceCenterId: string,
      body: UpdateServiceCenterBody,
    ): Promise<ServiceCenterSummary> {
      return unwrap(
        await http.patch<ServiceCenterSummary>(
          `/service-centers/${serviceCenterId}`,
          body,
        ),
      );
    },

    async deactivateServiceCenter(
      serviceCenterId: string,
    ): Promise<ServiceCenterSummary> {
      return unwrap(
        await http.patch<ServiceCenterSummary>(
          `/service-centers/${serviceCenterId}/deactivate`,
        ),
      );
    },
  };
}
