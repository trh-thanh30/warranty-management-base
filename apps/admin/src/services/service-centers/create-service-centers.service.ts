import type {
  CreateServiceCenterBody,
  ListServiceCentersQuery,
  PaginatedResponse,
  ServiceCenterSummary,
  ServiceCenterImportResult,
  UpdateServiceCenterBody,
} from "@repo/shared";
import { unwrap, unwrapBlob } from "../service.utils.ts";
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

    async downloadImportTemplate(): Promise<Blob> {
      const response = await http.get<Blob>(
        "/service-centers/import-template",
        { responseType: "blob" },
      );
      return unwrapBlob(response);
    },

    async exportServiceCenters(query: ListServiceCentersQuery): Promise<Blob> {
      const response = await http.get<Blob>("/service-centers/export", {
        params: query,
        responseType: "blob",
      });
      return unwrapBlob(response);
    },

    async importServiceCenters(file: File): Promise<ServiceCenterImportResult> {
      const formData = new FormData();
      formData.append("file", file);
      return unwrap(
        await http.post<ServiceCenterImportResult>(
          "/service-centers/import",
          formData,
        ),
      );
    },
  };
}
