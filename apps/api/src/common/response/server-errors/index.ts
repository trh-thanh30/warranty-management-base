/**
 * Server Error Classes (5xx)
 * Exports all server error classes that extend BaseServerError
 */

// Base class
export { BaseServerError } from '@/common/response/server-errors/base';

// Server error classes
export { InternalServerError } from '@/common/response/server-errors/internal-server-error';
