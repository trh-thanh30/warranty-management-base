import type {
  ApiResponse,
  HttpClient,
  PublicNetworkLocation,
} from "@repo/shared";
import { publicHttpClient } from "../../lib/public-http-client.ts";

export class NetworkLocationsService {
  private readonly http: Pick<HttpClient, "get">;

  constructor(http: Pick<HttpClient, "get">) {
    this.http = http;
  }

  async listNetworkLocations(): Promise<PublicNetworkLocation[]> {
    const response = await this.http.get<ApiResponse<PublicNetworkLocation[]>>(
      "/public/network-locations",
    );

    return response.data;
  }
}

export const networkLocationsService = new NetworkLocationsService(
  publicHttpClient,
);
