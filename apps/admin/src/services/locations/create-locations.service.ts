import type { VietnamProvince, VietnamWard } from "./locations.types";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type HttpResponse<T> = {
  data: ApiEnvelope<T>;
};

type RequestConfig = {
  params?: Record<string, unknown>;
};

export type LocationsHttpClient = {
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

export function createLocationsService(http: LocationsHttpClient) {
  return {
    async listVietnamProvinces(): Promise<VietnamProvince[]> {
      return unwrap(
        await http.get<VietnamProvince[]>("/locations/vietnam/provinces"),
      );
    },

    async listVietnamWards(provinceCode: number): Promise<VietnamWard[]> {
      return unwrap(
        await http.get<VietnamWard[]>("/locations/vietnam/wards", {
          params: { province: provinceCode },
        }),
      );
    },
  };
}
