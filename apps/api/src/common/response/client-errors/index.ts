/**
 * Client Error Classes (4xx)
 * Exports all client error classes that extend BaseClientError
 */

// Base class
export { BaseClientError } from '@/common/response/client-errors/base';

// Client error classes
// vi du la khi req body sai format, thieu filed
export { BadRequestError } from '@/common/response/client-errors/bad-request';

// chua dang nhap hoac token invalid
export { UnauthorizedError } from '@/common/response/client-errors/unauthorized';

// co dang nhap nhung kh co quyen
export { ForbiddenError } from '@/common/response/client-errors/forbidden';

// kh tim thay resource
export { NotFoundError } from '@/common/response/client-errors/not-found';

// resource bi trung
export { ConflictError } from '@/common/response/client-errors/conflict';

// data hop le ve format nhung vi pham business rule
export { ValidationError } from '@/common/response/client-errors/unprocessable-entity';

// goi api qua gioi han
export { RateLimitError } from '@/common/response/client-errors/too-many-requests';
