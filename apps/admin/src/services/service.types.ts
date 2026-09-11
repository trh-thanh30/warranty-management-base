export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type HttpResponse<T> = {
  data: ApiEnvelope<T>;
};

export type RequestConfig = {
  params?: Record<string, unknown>;
  responseType?: "blob";
  timeout?: number;
};

export type HttpDelete = <T>(
  url: string,
  config?: RequestConfig,
) => Promise<HttpResponse<T>>;

export type HttpGet = <T>(
  url: string,
  config?: RequestConfig,
) => Promise<HttpResponse<T>>;

export type HttpWrite = <T>(
  url: string,
  body?: unknown,
  config?: RequestConfig,
) => Promise<HttpResponse<T>>;
