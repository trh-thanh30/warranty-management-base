# Pagination, Filtering, Search

## Contract chuẩn

Các endpoint list dành cho Admin table và public list dùng chung response:

```ts
type PaginatedResponse<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
```

Query chuẩn:

```ts
type PaginationQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
```

Default:

```txt
page = 1
limit = 20
max limit = 100
sortOrder = desc
```

## Endpoint đã áp dụng

- `GET /api/v1/warranty-claims`
- `GET /api/v1/service-centers`
- `GET /api/v1/content-pages`
- `GET /api/v1/products`
- `GET /api/v1/customers`
- `GET /api/v1/public/service-centers`
- `GET /api/v1/public/content-pages`

## Warranty Claims

Endpoint:

```txt
GET /api/v1/warranty-claims
```

Query:

```ts
type Query = PaginationQuery & {
  search?: string;
  status?: WarrantyClaimStatus;
  priority?: WarrantyClaimPriority;
  warrantyCode?: string;
  claimCode?: string;
  serviceCenterId?: string;
  isOverdue?: "true" | "false";
  dueFrom?: string;
  dueTo?: string;
  dateFrom?: string;
  dateTo?: string;
};
```

Search match:

- `claimCode`
- `warrantyCode`
- `requesterName`
- `requesterPhone`
- `issueTitle`
- `product.name`

Sort fields:

```txt
claimCode
warrantyCode
status
priority
dueAt
submittedAt
resolvedAt
createdAt
updatedAt
```

## Service Centers

Endpoint:

```txt
GET /api/v1/service-centers
GET /api/v1/public/service-centers
```

Query:

```ts
type Query = PaginationQuery & {
  search?: string;
  province?: string;
  isActive?: "true" | "false";
};
```

Public endpoint luôn ép `isActive=true`.

Search match:

- `name`
- `phone`
- `email`
- `province`
- `district`
- `address`

Sort fields:

```txt
name
province
createdAt
updatedAt
isActive
```

## Content Pages

Endpoint:

```txt
GET /api/v1/content-pages
GET /api/v1/public/content-pages
```

Query:

```ts
type Query = PaginationQuery & {
  search?: string;
  kind?: ContentPageKind;
  status?: ContentPageStatus;
};
```

Public endpoint chỉ trả `PUBLISHED`.

Search match:

- `slug`
- `title`
- `summary`
- `content`

Admin sort fields:

```txt
slug
title
kind
status
publishedAt
createdAt
updatedAt
```

Public sort fields:

```txt
title
kind
publishedAt
updatedAt
```

## Products

Endpoint:

```txt
GET /api/v1/products
```

Query:

```ts
type Query = PaginationQuery & {
  search?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  warrantyStatus?: WarrantyStatus;
};
```

Search match:

- `name`
- `productCode`
- `warrantyCode`
- `serialNumber`
- `brand`
- `model`
- current owner `customer.fullName`

Sort fields:

```txt
productCode
warrantyCode
serialNumber
name
category
status
createdAt
updatedAt
```

## Customers

Endpoint:

```txt
GET /api/v1/customers
```

Query:

```ts
type Query = PaginationQuery & {
  search?: string;
};
```

Search match:

- `customerCode`
- `fullName`
- `phone`
- `email`

Sort fields:

```txt
customerCode
fullName
phone
email
createdAt
updatedAt
```

## FE usage

FE nên build table hook theo pattern:

```ts
type TableState = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters: Record<string, string | undefined>;
};
```

Khi filter/search thay đổi, reset `page` về `1`.

Không tự tính `totalPages` ở FE; dùng `meta.totalPages` từ BE.
