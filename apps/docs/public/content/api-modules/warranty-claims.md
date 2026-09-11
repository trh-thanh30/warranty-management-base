# Warranty Claims API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/warranty-claims
```

Warranty Claims API quản lý yêu cầu bảo hành/sửa chữa từ lúc gửi yêu cầu đến khi xử lý xong. Module này phục vụ Admin flow. Guest/public flow dùng thêm `Public Guest APIs`.

## Trạng thái

Status: `implemented`

Đã có:

- Tạo claim bằng `warrantyCode`.
- Sinh `claimCode` dạng `CLM000001`.
- List/filter claim cho Admin.
- Lookup theo `claimCode` hoặc `warrantyCode`.
- Detail claim.
- Timeline/status history.
- Validate status transition.
- Assign service center.
- Attachment qua Assets/AssetLink.
- Priority, `dueAt`, SLA breach tracking.
- Notification nội bộ khi tạo claim, đổi status, assign trạm, breach SLA.
- Metrics dashboard.

Chưa có:

- Export CSV/Excel cho claim.

## Base route

```txt
/api/v1/warranty-claims
```

## Auth

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
```

Guest endpoint tương ứng:

```txt
/api/v1/public/warranty-claims
/api/v1/public/warranty-claims/by-code/:claimCode
/api/v1/public/warranty-claims/by-warranty-code/:warrantyCode
```

## Permissions

- Create claim: `WARRANTY_CLAIM_CREATE`
- List/detail/lookup/timeline/assets/metrics: `WARRANTY_CLAIM_VIEW`
- Assign service center: `WARRANTY_CLAIM_UPDATE`
- Link/unlink attachment: `WARRANTY_CLAIM_UPDATE`
- Update priority/due date: `WARRANTY_CLAIM_UPDATE`
- Update status: `WARRANTY_CLAIM_STATUS_UPDATE`

## Enums

```ts
type WarrantyClaimStatus =
  | "SUBMITTED"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "IN_REPAIR"
  | "COMPLETED"
  | "CANCELLED";

type WarrantyClaimPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
```

Status transitions:

```txt
SUBMITTED -> REVIEWING | CANCELLED
REVIEWING -> APPROVED | REJECTED | CANCELLED
APPROVED -> IN_REPAIR | CANCELLED
IN_REPAIR -> COMPLETED | CANCELLED
REJECTED, COMPLETED, CANCELLED -> terminal
```

SLA mặc định:

```txt
LOW    -> dueAt sau 7 ngày
NORMAL -> dueAt sau 3 ngày
HIGH   -> dueAt sau 1 ngày
URGENT -> dueAt cuối ngày hiện tại
```

## Response chính

```ts
type WarrantyClaimResponse = {
  id: string;
  claimCode: string;
  warrantyId: string;
  productId: string;
  customerId: string | null;
  warrantyCode: string;
  requesterName: string | null;
  requesterPhone: string | null;
  issueTitle: string;
  issueDetail: string | null;
  status: WarrantyClaimStatus;
  priority: WarrantyClaimPriority;
  dueAt: string | null;
  slaBreachedAt: string | null;
  submittedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: ProductSummary | null;
  warranty: WarrantySummary | null;
  customer: CustomerSummary | null;
  serviceCenter: ServiceCenterSummary | null;
  statusHistory: WarrantyClaimStatusHistoryResponse[];
  attachments: WarrantyClaimAttachmentResponse[];
};
```

`statusHistory` và `attachments` luôn là array, có thể rỗng.

## Endpoints

### POST /api/v1/warranty-claims

Permission: `WARRANTY_CLAIM_CREATE`

Content-Type: `multipart/form-data`.

Fields:

```ts
type Body = {
  warrantyCode: string;
  requesterName: string;
  requesterPhone: string;
  issueTitle: string;
  issueDetail?: string;
  attachments: File[];
};
```

`attachments` bắt buộc có ít nhất một ảnh hoặc video. Không giới hạn số lượng
tệp trong form; mỗi tệp tối đa 10 MB và hỗ trợ JPG, PNG, GIF, WEBP, MP4, MOV.

Behavior:

- Trim/uppercase `warrantyCode`.
- Warranty phải tồn tại và không `VOIDED`.
- Tự sinh `claimCode`.
- Status mặc định `SUBMITTED`.
- Priority mặc định `NORMAL`.
- Tự set `dueAt` theo SLA.

### GET /api/v1/warranty-claims

Permission: `WARRANTY_CLAIM_VIEW`

Query:

```ts
type Query = {
  page?: number;
  limit?: number;
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
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
```

Response:

```ts
type Response = PaginatedResponse<WarrantyClaimResponse>;
```

Xem thêm `Pagination & Filtering` để biết field search/filter/sort hợp lệ.

### GET /api/v1/warranty-claims/metrics/summary

Permission: `WARRANTY_CLAIM_VIEW`

Query:

```ts
type Query = {
  dateFrom?: string;
  dateTo?: string;
  serviceCenterId?: string;
};
```

Response:

```ts
type Response = {
  total: number;
  createdToday: number;
  createdThisMonth: number;
  overdue: number;
  averageResolutionHours: number | null;
  byStatus: Array<{ status: WarrantyClaimStatus; count: number }>;
  byPriority: Array<{ priority: WarrantyClaimPriority; count: number }>;
  byServiceCenter: Array<{ serviceCenterId: string | null; count: number }>;
};
```

### GET /api/v1/warranty-claims/by-code/:claimCode

Permission: `WARRANTY_CLAIM_VIEW`

Response: `WarrantyClaimResponse`.

### GET /api/v1/warranty-claims/by-warranty-code/:warrantyCode

Permission: `WARRANTY_CLAIM_VIEW`

Response: `WarrantyClaimResponse[]`.

### GET /api/v1/warranty-claims/:id

Permission: `WARRANTY_CLAIM_VIEW`

Response: `WarrantyClaimResponse`.

### GET /api/v1/warranty-claims/:id/timeline

Permission: `WARRANTY_CLAIM_VIEW`

Response: `WarrantyClaimStatusHistoryResponse[]`.

### PATCH /api/v1/warranty-claims/:id/status

Permission: `WARRANTY_CLAIM_STATUS_UPDATE`

Body:

```ts
type Body = {
  status: WarrantyClaimStatus;
  note?: string;
};
```

BE validate transition theo bảng status ở trên và ghi timeline.

### PATCH /api/v1/warranty-claims/:id/assign-service-center

Permission: `WARRANTY_CLAIM_UPDATE`

Body:

```ts
type Body = {
  serviceCenterId: string;
  note?: string;
};
```

Chỉ assign vào service center đang active.

### PATCH /api/v1/warranty-claims/:id/priority

Permission: `WARRANTY_CLAIM_UPDATE`

Body:

```ts
type Body = {
  priority?: WarrantyClaimPriority;
  dueAt?: string;
};
```

Phải gửi ít nhất một trong hai field. Nếu chỉ đổi priority, BE tự tính lại `dueAt`.

### GET /api/v1/warranty-claims/:id/assets

Permission: `WARRANTY_CLAIM_VIEW`

Response: `WarrantyClaimAttachmentResponse[]`.

### POST /api/v1/warranty-claims/:id/assets

Permission: `WARRANTY_CLAIM_UPDATE`

Body:

```ts
type Body = {
  assetId: string;
  note?: string;
};
```

FE upload file bằng Assets API trước, sau đó link `assetId` vào claim.

### DELETE /api/v1/warranty-claims/:id/assets/:assetId

Permission: `WARRANTY_CLAIM_UPDATE`

Response:

```ts
type Response = {
  success: true;
};
```

Chỉ xóa link, không xóa asset gốc.

## FE checklist

- Sau khi tạo claim, hiển thị `claimCode` rõ ràng.
- Admin list có filter status, priority, overdue, service center và search.
- Detail hiển thị product/warranty/customer/request/service center.
- Timeline dùng `statusHistory`.
- Status update modal chỉ show next status hợp lệ.
- Attachment tab dùng Assets API + claim asset endpoints.
- Dashboard dùng `GET /metrics/summary`.
- Guest flow dùng `Public Guest APIs`, không dùng endpoint Admin.

## Changelog

- 2026-07-03: rút gọn docs claim, chuyển guest flow sang Public Guest APIs.
- 2026-07-03: bổ sung attachment, priority/SLA, notification và metrics.
- 2026-07-03: bổ sung service center assignment, status history và transition rules.
