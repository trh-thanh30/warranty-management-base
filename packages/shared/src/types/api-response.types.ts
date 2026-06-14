export type ApiResponse<T> = {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
};
