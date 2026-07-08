# Service Centers API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/service-centers
```

Service Centers API quản lý danh sách trạm bảo hành/trung tâm bảo hành. Module này phục vụ hai nhóm màn hình:

- Admin quản lý trạm bảo hành.
- Admin chọn trạm bảo hành khi assign một warranty claim.

FE dùng module này cho:

- Admin service center list.
- Admin create/update/deactivate service center.
- Dropdown service center trong màn claim detail.
- Trang “Trạm bảo hành” ở main FE qua Public Guest APIs.

## Trạng thái triển khai

Status: `implemented`

Đã có:

- Create service center.
- List/filter service center.
- Detail service center.
- Update service center.
- Deactivate service center bằng soft state `isActive = false`.
- Permission riêng cho service center.
- Public guest endpoint chỉ trả trạm active.

Chưa có:

- Delete cứng.
- Pagination.
- Tọa độ bản đồ.
- Giờ làm việc.

## Base route

```txt
/api/v1/service-centers
```

## Auth chung

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
```

Các endpoint dưới `/service-centers` yêu cầu auth và permission. Main FE/guest dùng:

```txt
GET /api/v1/public/service-centers
```

## Permissions

- List/detail: `SERVICE_CENTER_VIEW`
- Create: `SERVICE_CENTER_CREATE`
- Update: `SERVICE_CENTER_UPDATE`
- Deactivate: `SERVICE_CENTER_DELETE`

Role default hiện tại:

- `admin`: có tất cả permission.
- `moderator`: có view/create/update service center.
- `customer`: chưa có service center permission.

## Response ServiceCenter

```ts
type ServiceCenterResponse = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  province: string;
  district: string | null;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

## POST /api/v1/service-centers

Dùng cho: Admin tạo trạm bảo hành.

Permission:

```txt
SERVICE_CENTER_CREATE
```

Body:

```ts
type CreateServiceCenterBody = {
  name: string;
  phone?: string;
  email?: string;
  province: string;
  district?: string;
  address: string;
};
```

Validation:

- `name`: required, 2 đến 160 ký tự.
- `phone`: optional, 6 đến 32 ký tự.
- `email`: optional, email hợp lệ.
- `province`: required, 2 đến 120 ký tự.
- `district`: optional, 2 đến 120 ký tự.
- `address`: required, 4 đến 255 ký tự.

BE behavior:

- Trim các string field trước khi lưu.
- `isActive` mặc định là `true`.

Response:

```ts
type Response = ServiceCenterResponse;
```

FE triển khai chuẩn:

- Form create nên có `name`, `province`, `district`, `address`, `phone`, `email`.
- Sau success, refetch list hoặc insert item vào cache.
- Không gửi `isActive` trong create form hiện tại.

## GET /api/v1/service-centers

Dùng cho: Admin list trạm bảo hành và dropdown assign claim.

Permission:

```txt
SERVICE_CENTER_VIEW
```

Query params:

```ts
type ListServiceCentersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  province?: string;
  isActive?: "true" | "false";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
```

Validation:

- `search`: optional, 1 đến 120 ký tự.
- `province`: optional, 1 đến 120 ký tự.
- `isActive`: optional boolean string, chỉ `"true"` hoặc `"false"`.

Response:

```ts
type Response = PaginatedResponse<ServiceCenterResponse>;
```

BE behavior:

- `search` match theo `name`, `phone`, `email`, `province`, `district`, `address`.
- `province` filter dùng contains insensitive.
- `isActive` filter theo boolean.
- Sort theo `is_active desc`, `province asc`, `name asc`.
- Có pagination chuẩn qua `page`, `limit`.

FE triển khai chuẩn:

- Admin list nên có search, province filter, active/inactive filter.
- Dropdown assign claim nên gọi `isActive=true`.
- Empty state: “Chưa có trạm bảo hành”.
- FE dùng `meta` để render pagination.

## GET /api/v1/service-centers/:id

Dùng cho: Admin xem detail trạm bảo hành.

Permission:

```txt
SERVICE_CENTER_VIEW
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = ServiceCenterResponse;
```

Error:

- `404 Service center not found`

FE triển khai chuẩn:

- Nếu dùng drawer/detail panel, có thể reuse response từ list nếu đủ field.
- Nếu 404, quay về list hoặc show not-found state.

## PATCH /api/v1/service-centers/:id

Dùng cho: Admin cập nhật trạm bảo hành.

Permission:

```txt
SERVICE_CENTER_UPDATE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type UpdateServiceCenterBody = {
  name?: string;
  phone?: string;
  email?: string;
  province?: string;
  district?: string;
  address?: string;
  isActive?: boolean;
};
```

Validation:

- Các field string cùng rule với create nếu gửi.
- `isActive`: optional boolean.

Response:

```ts
type Response = ServiceCenterResponse;
```

BE behavior:

- Tìm service center theo id trước.
- Nếu không tồn tại, trả 404.
- Trim các string field nếu gửi.
- Update partial.

Error:

- `404 Service center not found`

FE triển khai chuẩn:

- Form edit nên gửi only changed fields hoặc full form đều được.
- Sau update, refresh list/detail/dropdown.
- Nếu set inactive, service center sẽ không được assign mới cho claim vì claim assign chỉ nhận active center.

## PATCH /api/v1/service-centers/:id/deactivate

Dùng cho: Admin vô hiệu hóa trạm bảo hành.

Permission:

```txt
SERVICE_CENTER_DELETE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type Body = {};
```

Response:

```ts
type Response = ServiceCenterResponse;
```

BE behavior:

- Gọi update use case với `isActive = false`.
- Không xóa record khỏi DB.
- Claim cũ vẫn giữ relation với service center inactive.
- Claim mới không assign được vào inactive center qua Warranty Claims API.

Error:

- `404 Service center not found`

FE triển khai chuẩn:

- UI nên label action là “Deactivate” hoặc “Ngừng hoạt động”, không gọi là delete cứng.
- Nên confirm trước khi deactivate.
- Sau success, refresh list và dropdown active centers.

## Liên quan tới Warranty Claims

Warranty claim response có field:

```ts
type WarrantyClaimResponse = {
  serviceCenter: ServiceCenterSummary | null;
};
```

Assign claim dùng endpoint:

```txt
PATCH /api/v1/warranty-claims/:id/assign-service-center
```

Body:

```ts
type AssignWarrantyClaimServiceCenterBody = {
  serviceCenterId: string;
  note?: string;
};
```

FE nên gọi list service centers với:

```txt
GET /api/v1/service-centers?isActive=true
```

rồi dùng response làm options cho combobox/select.

## Backend files quan trọng

```txt
apps/api/src/modules/service-centers/service-centers.controller.ts
apps/api/src/modules/service-centers/service-centers.module.ts
apps/api/src/modules/service-centers/repository/service-centers.repository.ts
apps/api/src/modules/service-centers/service-centers.types.ts
apps/api/src/modules/service-centers/use-cases/create-service-center.use-case.ts
apps/api/src/modules/service-centers/use-cases/list-service-centers.use-case.ts
apps/api/src/modules/service-centers/use-cases/get-service-center-detail.use-case.ts
apps/api/src/modules/service-centers/use-cases/update-service-center.use-case.ts
```

## Checklist UI Service Centers

- List có search, province filter, active/inactive filter.
- Create/edit form validate giống BE.
- Deactivate cần confirm.
- Dropdown assign claim chỉ lấy active centers.
- Nếu service center inactive nhưng đã gắn với claim cũ, vẫn hiển thị trong claim detail.
- Không assume có pagination.
- Không assume endpoint public cho guest.

## Changelog

- 2026-07-03: tạo docs ban đầu cho phase 3 service centers.
