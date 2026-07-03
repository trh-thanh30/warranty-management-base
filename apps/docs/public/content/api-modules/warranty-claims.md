# Warranty Claims API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/warranty-claims
```

Warranty Claims API quản lý yêu cầu bảo hành/sửa chữa từ lúc customer gửi yêu cầu đến khi admin xử lý xong. Module này là workflow chính của nghiệp vụ “Yêu cầu bảo hành” và “Tra cứu bảo hành”.

FE dùng module này cho:

- Customer form gửi yêu cầu bảo hành bằng `warrantyCode`.
- Admin claim list.
- Admin claim detail.
- Admin đổi trạng thái xử lý.
- Admin assign claim vào trạm bảo hành.
- Admin/customer support tra cứu claim theo `claimCode` hoặc `warrantyCode`.
- Admin xem timeline xử lý claim.

## Trạng thái triển khai

Status: `implemented`

Đã có:

- Tạo claim bằng `warrantyCode`.
- Sinh `claimCode` tuần tự dạng `CLM000001`.
- List/filter claim.
- Lookup theo `claimCode`.
- Lookup danh sách claim theo `warrantyCode`.
- Detail claim.
- Cập nhật trạng thái có validate transition.
- Ghi lịch sử trạng thái/timeline.
- Ghi `note` khi đổi trạng thái.
- Assign claim vào service center/trạm bảo hành.
- Attachment claim qua Asset/AssetLink.
- Priority, due date và SLA breach tracking.
- Notification nội bộ khi tạo claim, đổi trạng thái, assign trạm và claim quá hạn SLA.
- Dashboard metrics tổng hợp cho admin.
- Response claim trả kèm `product`, `warranty`, `customer`, `serviceCenter`, `statusHistory`.

Chưa có, để phase sau:

- Pagination cho list claim.

## Base route

```txt
/api/v1/warranty-claims
```

## Auth chung

```txt
Authorization: Bearer <access_token>
```

Admin nên gửi:

```txt
x-auth-context: admin
```

Customer nên gửi:

```txt
x-auth-context: client
```

Hiện các endpoint claim đều yêu cầu auth và permission. Nếu FE muốn public lookup cho guest thì cần BE phase riêng để mở `@Public()`/`@OptionalAuth()`.

## Permissions

- Create claim: `WARRANTY_CLAIM_CREATE`
- List/detail/lookup/timeline: `WARRANTY_CLAIM_VIEW`
- Assign service center: `WARRANTY_CLAIM_UPDATE`
- Link/unlink attachment: `WARRANTY_CLAIM_UPDATE`
- Update priority/due date: `WARRANTY_CLAIM_UPDATE`
- Update status: `WARRANTY_CLAIM_STATUS_UPDATE`

## Priority enum

```ts
type WarrantyClaimPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
```

SLA mặc định khi tạo claim:

```txt
LOW    -> dueAt sau 7 ngày
NORMAL -> dueAt sau 3 ngày
HIGH   -> dueAt sau 1 ngày
URGENT -> dueAt cuối ngày hiện tại
```

Rule quan trọng:

- Claim mới mặc định `priority = NORMAL`.
- Claim mới tự có `dueAt` theo SLA mặc định.
- Khi cập nhật priority mà không gửi `dueAt`, BE tự tính lại `dueAt` theo priority mới.
- Nếu claim chưa terminal và `dueAt < now`, BE set `slaBreachedAt`.
- Khi claim chuyển terminal status, BE không tính breach mới.

Role default hiện tại:

- `admin`: có tất cả permission.
- `moderator`: có view/create/update/status update claim.
- `customer`: có `WARRANTY_CLAIM_CREATE`, chưa có view claim mặc định.

## Status enum

```ts
type WarrantyClaimStatus =
  | "SUBMITTED"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "IN_REPAIR"
  | "COMPLETED"
  | "CANCELLED";
```

Luồng chuyển trạng thái hợp lệ:

```txt
SUBMITTED -> REVIEWING
SUBMITTED -> CANCELLED

REVIEWING -> APPROVED
REVIEWING -> REJECTED
REVIEWING -> CANCELLED

APPROVED -> IN_REPAIR
APPROVED -> CANCELLED

IN_REPAIR -> COMPLETED
IN_REPAIR -> CANCELLED

REJECTED, COMPLETED, CANCELLED -> terminal, không chuyển tiếp
```

Rule quan trọng:

- Nếu gửi status trùng status hiện tại, BE trả `400`.
- Nếu gửi transition không hợp lệ, BE trả `400`.
- Khi status là `COMPLETED`, `REJECTED`, hoặc `CANCELLED`, BE set `resolvedAt = now`.
- Khi status khác terminal, BE set `resolvedAt = null`.
- `note` được lưu vào `statusHistory`.

## Response WarrantyClaim

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
  product: {
    id: string;
    productCode: string;
    warrantyCode: string;
    serialNumber: string | null;
    name: string;
    brand: string | null;
    model: string | null;
    status: string;
  } | null;
  warranty: {
    id: string;
    warrantyCode: string;
    startDate: string | null;
    endDate: string | null;
    status: string;
  } | null;
  customer: {
    id: string;
    customerCode: string;
    fullName: string;
    phone: string | null;
    email: string | null;
  } | null;
  serviceCenter: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    province: string;
    district: string | null;
    address: string;
    isActive: boolean;
  } | null;
  statusHistory: WarrantyClaimStatusHistoryResponse[];
  attachments: WarrantyClaimAttachmentResponse[];
};
```

## Response WarrantyClaimStatusHistory

```ts
type WarrantyClaimStatusHistoryResponse = {
  id: string;
  fromStatus: WarrantyClaimStatus | null;
  toStatus: WarrantyClaimStatus;
  note: string | null;
  changedByUserId: string | null;
  changedBy: {
    id: string;
    username: string;
    fullName: string | null;
    email: string;
  } | null;
  createdAt: string;
};
```

## Response WarrantyClaimAttachment

```ts
type WarrantyClaimAttachmentResponse = {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  type: string;
  accessType: string;
  uploadedById: string | null;
  createdAt: string;
};
```

FE lưu ý:

- `statusHistory` luôn là array trong response mapper, có thể rỗng.
- `attachments` luôn là array trong response mapper, có thể rỗng.
- Attachment dùng chung Assets module. FE upload file bằng Assets API trước, sau đó gọi claim attachment endpoint để link `assetId`.
- `url` hiện lấy từ asset `path` nếu asset chưa được resolve CDN URL.
- Assignment service center cũng tạo một history item, trong đó `fromStatus` và `toStatus` bằng status hiện tại.
- `changedBy` có thể `null` nếu user bị xóa hoặc action không có user context.

## POST /api/v1/warranty-claims

Dùng cho: Customer tạo claim hoặc Admin tạo giúp customer.

Permission:

```txt
WARRANTY_CLAIM_CREATE
```

Body:

```ts
type CreateWarrantyClaimBody = {
  warrantyCode: string;
  requesterName?: string;
  requesterPhone?: string;
  issueTitle: string;
  issueDetail?: string;
};
```

Validation:

- `warrantyCode`: required, 6 đến 64 ký tự, chữ/số/gạch ngang.
- `requesterName`: optional, 1 đến 255 ký tự.
- `requesterPhone`: optional, 1 đến 32 ký tự.
- `issueTitle`: required, 3 đến 255 ký tự.
- `issueDetail`: optional, 1 đến 4000 ký tự.

BE behavior:

- Trim và uppercase `warrantyCode`.
- Tìm product chưa delete theo `warranty_code`.
- Warranty phải tồn tại.
- Nếu warranty status là `VOIDED`, trả bad request.
- Tự sinh `claimCode` dạng `CLM000001`, tăng dần.
- Nếu bị đụng unique `claim_code` khi tạo do request đồng thời, BE retry tối đa 3 lần.
- Nếu product có current owner, claim sẽ gắn với customer đó.
- Status mặc định là `SUBMITTED`.

Response:

```ts
type Response = WarrantyClaimResponse;
```

Error:

- `404 Warranty not found`
- `400 Warranty is voided`
- `400 Could not create warranty claim`

FE triển khai chuẩn:

- Customer form cần `warrantyCode`, `issueTitle`, `issueDetail`.
- Nếu customer đã login, FE có thể prefill `requesterName`/`requesterPhone` từ profile.
- Sau success, show `claimCode` rõ ràng để user lưu lại.
- Nếu warranty voided, hiển thị message riêng thay vì generic error.

## GET /api/v1/warranty-claims

Dùng cho: Admin claim list.

Permission:

```txt
WARRANTY_CLAIM_VIEW
```

Query params:

```ts
type ListWarrantyClaimsQuery = {
  search?: string;
  status?: WarrantyClaimStatus;
  priority?: WarrantyClaimPriority;
  warrantyCode?: string;
  claimCode?: string;
  serviceCenterId?: string;
  isOverdue?: "true" | "false";
  dueFrom?: string;
  dueTo?: string;
};
```

Validation:

- `status`: enum `WarrantyClaimStatus`.
- `priority`: enum `WarrantyClaimPriority`.
- `warrantyCode`: 6 đến 64 ký tự, chữ/số/gạch ngang.
- `claimCode`: 6 đến 64 ký tự, chữ/số/gạch ngang.
- `serviceCenterId`: UUID.
- `isOverdue`: boolean string.
- `dueFrom`, `dueTo`: ISO date string.

Response:

```ts
type Response = WarrantyClaimResponse[];
```

BE behavior:

- `search` match theo `claimCode`, `warrantyCode`, `requesterName`, `requesterPhone`, `issueTitle`, `product.name`.
- `warrantyCode` và `claimCode` được trim + uppercase.
- Có thể filter theo `status` và `serviceCenterId`.
- Có thể filter theo `priority`, overdue và khoảng `dueAt`.
- `isOverdue=true` lọc claim có `dueAt < now` và chưa terminal.
- Sort theo `created_at desc`.
- Hiện chưa có pagination.

FE triển khai chuẩn:

- Admin table nên có filter status, priority, overdue, warrantyCode, claimCode, serviceCenter.
- Search input debounce.
- Vì chưa pagination, chưa build pagination thật.
- Columns nên có: claimCode, warrantyCode, requester, product.name, issueTitle, status, priority, dueAt, serviceCenter, submittedAt, resolvedAt.
- Empty state: “Chưa có yêu cầu bảo hành”.

## GET /api/v1/warranty-claims/by-code/:claimCode

Dùng cho: Admin/support tra cứu claim theo claimCode.

Permission:

```txt
WARRANTY_CLAIM_VIEW
```

Path params:

```ts
type Params = {
  claimCode: string;
};
```

Response:

```ts
type Response = WarrantyClaimResponse;
```

BE behavior:

- Trim và uppercase `claimCode`.

Error:

- `404 Warranty claim not found`

FE triển khai chuẩn:

- Dùng cho quick lookup.
- Nếu 404, show not-found state.

## GET /api/v1/warranty-claims/by-warranty-code/:warrantyCode

Dùng cho: Admin xem tất cả claim của một warranty.

Permission:

```txt
WARRANTY_CLAIM_VIEW
```

Path params:

```ts
type Params = {
  warrantyCode: string;
};
```

Response:

```ts
type Response = WarrantyClaimResponse[];
```

BE behavior:

- Trim và uppercase `warrantyCode`.
- Trả list sort `created_at desc`.
- Không throw 404 nếu không có claim, trả array rỗng.

FE triển khai chuẩn:

- Dùng trong warranty/product detail để hiển thị lịch sử claims.
- Empty state: “Chưa có yêu cầu bảo hành”.

## GET /api/v1/warranty-claims/:id

Dùng cho: Admin claim detail.

Permission:

```txt
WARRANTY_CLAIM_VIEW
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = WarrantyClaimResponse;
```

Error:

- `404 Warranty claim not found`

FE triển khai chuẩn:

- Detail page nên hiển thị product, warranty, customer, serviceCenter, issueDetail và statusHistory.
- Timeline nên sort theo `createdAt asc`, BE đã trả đúng thứ tự.
- Nếu `serviceCenter = null`, hiển thị action assign nếu user có permission.

## GET /api/v1/warranty-claims/:id/timeline

Dùng cho: Admin lấy riêng timeline xử lý claim.

Permission:

```txt
WARRANTY_CLAIM_VIEW
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = WarrantyClaimStatusHistoryResponse[];
```

BE behavior:

- Tìm claim theo id.
- Trả `statusHistory` từ response mapper.

Error:

- `404 Warranty claim not found`

FE triển khai chuẩn:

- Nếu detail response đã có `statusHistory`, không cần gọi endpoint này ngay.
- Dùng endpoint này khi màn detail muốn refetch timeline nhẹ hơn refetch cả claim.

## PATCH /api/v1/warranty-claims/:id/status

Dùng cho: Admin cập nhật trạng thái claim.

Permission:

```txt
WARRANTY_CLAIM_STATUS_UPDATE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type UpdateWarrantyClaimStatusBody = {
  status: WarrantyClaimStatus;
  note?: string;
};
```

Validation:

- `status`: enum `WarrantyClaimStatus`.
- `note`: optional, 1 đến 2000 ký tự.

Response:

```ts
type Response = WarrantyClaimResponse;
```

BE behavior:

- Tìm claim theo id.
- Không cho update nếu status mới trùng status hiện tại.
- Validate transition theo bảng status ở đầu file.
- Persist history gồm `fromStatus`, `toStatus`, `note`, `changedByUserId`.
- Nếu status là `COMPLETED`, `REJECTED`, hoặc `CANCELLED`, BE set `resolvedAt = now`.
- Nếu status khác terminal, BE set `resolvedAt = null`.

Error:

- `404 Warranty claim not found`
- `400 Warranty claim already has this status`
- `400 Warranty claim status transition is invalid`

FE triển khai chuẩn:

- UI chỉ nên show các next status hợp lệ theo status hiện tại.
- Nếu BE trả 400 invalid transition, refetch detail vì có thể data cũ.
- Note field nên đặt trong modal đổi trạng thái.
- Sau success, refresh list/detail/timeline cache.
- Terminal status nên hiển thị `resolvedAt`.

## PATCH /api/v1/warranty-claims/:id/assign-service-center

Dùng cho: Admin assign claim vào trạm bảo hành.

Permission:

```txt
WARRANTY_CLAIM_UPDATE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type AssignWarrantyClaimServiceCenterBody = {
  serviceCenterId: string;
  note?: string;
};
```

Validation:

- `serviceCenterId`: required UUID.
- `note`: optional, 1 đến 2000 ký tự.

Response:

```ts
type Response = WarrantyClaimResponse;
```

BE behavior:

- Tìm claim theo id.
- Reject nếu claim đã assign đúng service center này.
- Chỉ cho assign vào service center đang active.
- Update `service_center_id`.
- Tạo status history item với `fromStatus = toStatus = currentStatus`.
- Nếu không gửi note, BE dùng note mặc định `Assigned service center`.

Error:

- `404 Warranty claim not found`
- `404 Active service center not found`
- `400 Warranty claim is already assigned to this service center`

FE triển khai chuẩn:

- Dropdown service center nên chỉ list active centers.
- Sau assign, refresh claim detail/list.
- Timeline nên hiển thị assignment như một event vận hành, không phải status transition.

## PATCH /api/v1/warranty-claims/:id/priority

Dùng cho: Admin cập nhật priority hoặc due date của claim.

Permission:

```txt
WARRANTY_CLAIM_UPDATE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type UpdateWarrantyClaimPriorityBody = {
  priority?: WarrantyClaimPriority;
  dueAt?: string;
};
```

Validation:

- `priority`: optional enum `WarrantyClaimPriority`.
- `dueAt`: optional ISO date string.
- Phải gửi ít nhất một trong hai field `priority` hoặc `dueAt`.

Response:

```ts
type Response = WarrantyClaimResponse;
```

BE behavior:

- Tìm claim theo id.
- Nếu chỉ gửi `priority`, BE tự tính lại `dueAt` theo SLA mặc định.
- Nếu gửi `dueAt`, BE dùng đúng due date FE gửi.
- Sau update, BE tính lại `slaBreachedAt` theo `dueAt` và status hiện tại.

Error:

- `404 Warranty claim not found`
- `400 Priority or due date is required`

FE triển khai chuẩn:

- Priority nên là select/badge gồm `LOW`, `NORMAL`, `HIGH`, `URGENT`.
- Cho phép admin override `dueAt` bằng date/time picker.
- Nếu response có `slaBreachedAt`, hiển thị trạng thái quá hạn nổi bật trong list/detail.

## GET /api/v1/warranty-claims/:id/assets

Dùng cho: Admin xem danh sách attachment của claim.

Permission:

```txt
WARRANTY_CLAIM_VIEW
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = WarrantyClaimAttachmentResponse[];
```

Error:

- `404 Warranty claim not found`

FE triển khai chuẩn:

- Detail page có thể dùng `attachments` trong `GET /:id`; endpoint này dùng khi muốn refetch riêng attachment.
- Nên render preview theo `mimeType`: ảnh preview, video link/player, file download.

## POST /api/v1/warranty-claims/:id/assets

Dùng cho: Admin link asset đã upload vào claim.

Permission:

```txt
WARRANTY_CLAIM_UPDATE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type LinkWarrantyClaimAssetBody = {
  assetId: string;
  note?: string;
};
```

Validation:

- `assetId`: required UUID.
- `note`: optional, 1 đến 500 ký tự.

Response:

```ts
type Response = WarrantyClaimAttachmentResponse;
```

BE behavior:

- Tìm claim theo id.
- Tìm asset chưa bị delete theo `assetId`.
- Link asset vào claim bằng `AssetLink` với `entityType = "warranty_claim"`.
- Nếu asset đã link claim này rồi, endpoint vẫn trả attachment hiện tại.

Error:

- `404 Warranty claim not found`
- `404 Asset not found`

FE triển khai chuẩn:

- Flow upload: gọi Assets API để upload file, lấy `assetId`, sau đó gọi endpoint này.
- Sau success, refresh attachment list hoặc append item response vào UI.

## DELETE /api/v1/warranty-claims/:id/assets/:assetId

Dùng cho: Admin gỡ link attachment khỏi claim.

Permission:

```txt
WARRANTY_CLAIM_UPDATE
```

Path params:

```ts
type Params = {
  id: string;
  assetId: string;
};
```

Response:

```ts
type Response = {
  success: true;
};
```

BE behavior:

- Chỉ xóa link giữa asset và claim.
- Không xóa asset gốc trong Assets module.

Error:

- `404 Warranty claim not found`
- `404 Warranty claim asset link not found`

FE triển khai chuẩn:

- Dùng confirm dialog trước khi gỡ file.
- Sau success, remove item khỏi attachment list.

## GET /api/v1/warranty-claims/metrics/summary

Dùng cho: Admin dashboard claim.

Permission:

```txt
WARRANTY_CLAIM_VIEW
```

Query params:

```ts
type WarrantyClaimMetricsQuery = {
  dateFrom?: string;
  dateTo?: string;
  serviceCenterId?: string;
};
```

Validation:

- `dateFrom`, `dateTo`: optional ISO date string.
- `serviceCenterId`: optional UUID.

Response:

```ts
type WarrantyClaimMetricsResponse = {
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

BE behavior:

- `total`, group status/priority/service center áp dụng theo filter date/service center.
- `createdToday` và `createdThisMonth` tính theo ngày hiện tại của server, có áp filter service center.
- `overdue` là claim chưa terminal và `dueAt < now`.
- `averageResolutionHours` tính từ `createdAt` đến `resolvedAt` của claim đã resolve.

FE triển khai chuẩn:

- Dashboard nên có cards: total, createdToday, createdThisMonth, overdue, averageResolutionHours.
- Có thể vẽ chart theo `byStatus`, `byPriority`, `byServiceCenter`.
- Nếu `averageResolutionHours = null`, hiển thị “Chưa có dữ liệu”.

## Checklist UI Claims

- Customer create form show `claimCode` sau success.
- Admin list có status filter, priority filter, overdue filter, service center filter và search.
- Detail phân nhóm product/warranty/customer/request/service center.
- Timeline hiển thị status changes và assignment events.
- Status update modal chỉ show next statuses hợp lệ.
- Assign service center modal dùng Service Centers API.
- Attachment tab dùng Assets API + claim asset link endpoints.
- Priority/due date control dùng `PATCH /:id/priority`.
- Dashboard dùng `GET /metrics/summary`.
- Không assume endpoint list có pagination.

## Backend files quan trọng

```txt
apps/api/src/modules/warranty-claims/warranty-claims.controller.ts
apps/api/src/modules/warranty-claims/warranty-claims.module.ts
apps/api/src/modules/warranty-claims/repository/warranty-claims.repository.ts
apps/api/src/modules/warranty-claims/warranty-claims.types.ts
apps/api/src/modules/warranty-claims/use-cases/create-warranty-claim.use-case.ts
apps/api/src/modules/warranty-claims/use-cases/update-warranty-claim-status.use-case.ts
apps/api/src/modules/warranty-claims/use-cases/assign-warranty-claim-service-center.use-case.ts
apps/api/src/modules/warranty-claims/use-cases/get-warranty-claim-timeline.use-case.ts
apps/api/src/modules/warranty-claims/use-cases/link-warranty-claim-asset.use-case.ts
apps/api/src/modules/warranty-claims/use-cases/update-warranty-claim-priority.use-case.ts
apps/api/src/modules/warranty-claims/use-cases/get-warranty-claim-metrics.use-case.ts
apps/api/src/modules/warranty-claims/service/warranty-claim-sla.service.ts
apps/api/src/modules/warranty-claims/service/warranty-claim-notification.service.ts
```

## Changelog

- 2026-07-03: cập nhật docs theo phase 4, bổ sung attachment, priority/SLA, notification và metrics.
- 2026-07-03: cập nhật docs theo phase 3, bổ sung service center assignment, status history, transition rules và response mới.
