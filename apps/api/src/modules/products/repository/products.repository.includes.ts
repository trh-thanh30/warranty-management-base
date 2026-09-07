import {
  asset_access_type,
  warranty_activation_request_status,
} from '@prisma/client';

export const openActivationRequestStatuses = [
  warranty_activation_request_status.PENDING,
  warranty_activation_request_status.APPROVED,
];

export const productInclude = {
  assets: {
    include: { asset: true },
    orderBy: [{ role: 'asc' as const }, { sort_order: 'asc' as const }],
  },
  ownerships: {
    include: { customer: true },
    orderBy: { created_at: 'desc' as const },
  },
  warranty: true,
  activation_codes: {
    orderBy: [{ created_at: 'asc' as const }, { id: 'asc' as const }],
    select: {
      id: true,
      code_ciphertext: true,
      status: true,
      expires_at: true,
      batch: { select: { batch_code: true } },
      request: { select: { id: true } },
      request_items: { select: { id: true }, take: 1 },
      warranty: { select: { id: true } },
    },
  },
  warranty_activation_requests: {
    where: { status: { in: openActivationRequestStatuses } },
    select: { id: true, activation_code_id: true },
    take: 1,
  },
  category_ref: true,
};

export const productListInclude = {
  ...productInclude,
  assets: {
    where: { role: 'COVER' as const },
    include: { asset: true },
    orderBy: { sort_order: 'asc' as const },
  },
};

export const activationProductOptionInclude = {
  ...productListInclude,
  warranty_activation_requests: {
    where: { status: { in: openActivationRequestStatuses } },
    select: { id: true, request_code: true, status: true },
    orderBy: { created_at: 'desc' as const },
  },
  warranty_activation_request_items: {
    where: { status: { in: openActivationRequestStatuses } },
    select: {
      status: true,
      activation_code_id: true,
      request: {
        select: { request_code: true, status: true },
      },
    },
    orderBy: { created_at: 'desc' as const },
  },
};

export const publicProductListInclude = {
  category_ref: true,
  warranty: true,
  assets: {
    where: {
      role: 'COVER' as const,
      asset: {
        access_type: asset_access_type.PUBLIC,
        is_deleted: false,
      },
    },
    include: { asset: true },
    orderBy: { sort_order: 'asc' as const },
  },
};
