import { unwrap } from "../service.utils.ts";
import type {
  LocationsHttpClient,
  VietnamProvince,
  VietnamWard,
} from "./locations.types";

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
