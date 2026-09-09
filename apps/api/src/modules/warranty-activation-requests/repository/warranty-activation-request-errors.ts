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

export class WarrantyActivationRequestWarrantyCodeConflictError extends WarrantyActivationRequestUniqueConflictError {
  constructor() {
    super(['warranty_code']);
    this.name = 'WarrantyActivationRequestWarrantyCodeConflictError';
  }
}

export class WarrantyActivationCodeReservationConflictError extends Error {
  constructor() {
    super('One or more activation codes are no longer available');
    this.name = 'WarrantyActivationCodeReservationConflictError';
  }
}

export class WarrantyActivationRequestUpdateConflictError extends Error {
  constructor() {
    super('Warranty activation request is no longer pending');
    this.name = 'WarrantyActivationRequestUpdateConflictError';
  }
}
