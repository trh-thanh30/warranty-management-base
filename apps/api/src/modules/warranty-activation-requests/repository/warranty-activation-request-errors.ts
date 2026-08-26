export class WarrantyActivationRequestUniqueConflictError extends Error {
  constructor(readonly target?: string[]) {
    super('Warranty activation request violates a unique constraint');
    this.name = 'WarrantyActivationRequestUniqueConflictError';
  }
}

export class WarrantyActivationRequestCodeConflictError extends WarrantyActivationRequestUniqueConflictError {
  constructor() {
    super(['request_code']);
    this.name = 'WarrantyActivationRequestCodeConflictError';
  }
}
