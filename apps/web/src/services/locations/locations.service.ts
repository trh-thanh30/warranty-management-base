import { publicHttpClient } from "@/src/lib/public-http-client";
import type {
  ApiResponse,
  HttpClient,
  VietnamProvince,
  VietnamWard,
} from "@repo/shared";

export class LocationsService {
  constructor(private readonly http: Pick<HttpClient, "get">) {}

  async listVietnamProvinces(): Promise<VietnamProvince[]> {
    const response = await this.http.get<ApiResponse<VietnamProvince[]>>(
      "/locations/vietnam/provinces",
    );
    return response.data;
  }

  async listVietnamWards(provinceCode: number): Promise<VietnamWard[]> {
    const response = await this.http.get<ApiResponse<VietnamWard[]>>(
      "/locations/vietnam/wards",
      { params: { province: provinceCode } },
    );
    return response.data;
  }
}

export const locationsService = new LocationsService(publicHttpClient);
