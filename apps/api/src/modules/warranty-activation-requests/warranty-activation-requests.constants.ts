import { warranty_activation_request_status } from '@prisma/client';

export const OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES: warranty_activation_request_status[] =
  [
    warranty_activation_request_status.PENDING,
    warranty_activation_request_status.APPROVED,
  ];
