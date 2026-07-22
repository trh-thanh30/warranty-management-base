import type { HttpResponse } from "./service.types";

export function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

export function unwrapBlob(response: HttpResponse<Blob>): Blob {
  return response.data as unknown as Blob;
}
