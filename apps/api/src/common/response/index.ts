/**
 * Response Classes
 * Exports all response classes from success, client-errors, and server-errors
 */

// Success responses
export * from '@/common/response/success';

// Client errors (4xx)
export * from '@/common/response/client-errors';

// Server errors (5xx)
export * from '@/common/response/server-errors';

/**
 * Helper function to create a raw response that bypasses the interceptor
 */
export function createRawResponse<T = any>(data: T): { __raw: true; data: T } {
  return {
    __raw: true,
    data,
  };
}
