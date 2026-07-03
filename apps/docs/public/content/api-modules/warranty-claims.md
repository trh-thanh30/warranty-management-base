# Warranty Claims API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/warranty-claims
```

Warranty Claims API quản lý yêu cầu bảo hành/sửa chữa. Customer hoặc Admin có thể tạo claim bằng warrantyCode, Admin có thể list, lookup và cập nhật trạng thái xử lý.

FE dùng module này cho:

- Customer form gửi yêu cầu bảo hành.
- Admin claim list.
- Admin claim detail.
- Admin update claim status.
- Tra cứu claim theo `claimCode` hoặc `warrantyCode`.

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

## Permissions

- Create cần `WARRANTY_CLAIM_CREATE`.
- List/detail/lookup cần `WARRANTY_CLAIM_VIEW`.
- Update status cần `WARRANTY_CLAIM_STATUS_UPDATE`.

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
  status: string;
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
};
```

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

Required:

- `warrantyCode`
- `issueTitle`

Validation:

- `warrantyCode`: 6 đến 64 ký tự, chữ/số/gạch ngang.
- `requesterName`: 1 đến 255 ký tự nếu gửi.
- `requesterPhone`: 1 đến 32 ký tự nếu gửi.
- `issueTitle`: 3 đến 255 ký tự.
- `issueDetail`: 1 đến 4000 ký tự nếu gửi.

BE behavior:

- Uppercase warrantyCode.
- Tìm product chưa delete theo warrantyCode.
- Warranty phải tồn tại.
- Nếu warranty status là `VOIDED`, trả bad request.
- Tự sinh claimCode dạng `CLM000001`, tăng dần.
- Nếu product có current owner, claim sẽ gắn với customer đó.

Response:

```ts
type Response = WarrantyClaimResponse;
```

Error:

- `404 Warranty not found`.
- `400 Warranty is voided`.
- `400 Could not create warranty claim`.

FE triển khai chuẩn:

- Customer form cần warrantyCode, issueTitle, issueDetail.
- Nếu customer đã login, FE có thể prefill requesterName/phone từ profile nhưng vẫn gửi optional.
- Sau success, show claimCode rõ ràng để user lưu lại.
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
  status?: string;
  warrantyCode?: string;
  claimCode?: string;
};
```

Response:

```ts
type Response = WarrantyClaimResponse[];
```

BE behavior:

- `search` match theo claimCode, warrantyCode, requesterName, requesterPhone, issueTitle, product.name.
- `warrantyCode` và `claimCode` được uppercase.
- Sort theo `created_at desc`.
- Hiện chưa có pagination.

FE triển khai chuẩn:

- Admin table nên có filter status, warrantyCode, claimCode.
- Search input debounce.
- Vì chưa pagination, chưa build pagination thật.
- Columns nên có: claimCode, warrantyCode, requester, product.name, issueTitle, status, submittedAt, resolvedAt.

## GET /api/v1/warranty-claims/by-code/:claimCode

Dùng cho: Admin hoặc support tra cứu claim theo claimCode.

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

- Trim và uppercase claimCode.

Error:

- `404 Warranty claim not found`.

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

- Trim và uppercase warrantyCode.
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

- `404 Warranty claim not found`.

FE triển khai chuẩn:

- Detail page nên hiển thị product, warranty, customer, issueDetail và status history nếu sau này BE bổ sung.

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
  status: string;
  note?: string;
};
```

Validation:

- `status`: enum `warranty_claim_status` từ Prisma.
- `note`: 1 đến 2000 ký tự nếu gửi.

Response:

```ts
type Response = WarrantyClaimResponse;
```

BE behavior:

- Nếu status là `COMPLETED`, `REJECTED`, hoặc `CANCELLED`, BE set `resolvedAt = now`.
- Nếu status khác, BE set `resolvedAt = null`.
- Hiện tại `note` được validate nhưng use case chưa lưu note.

Error:

- `404 Warranty claim not found`.

FE triển khai chuẩn:

- Nếu UI có note, cần biết hiện BE chưa persist note.
- Sau update, refresh list/detail.
- Terminal status nên hiển thị resolvedAt.

## Checklist UI Claims

- Customer create form show claimCode sau success.
- Admin list có status filter và search.
- Detail phân nhóm product/warranty/customer/request.
- Status update dùng permission guard.
- Không assume endpoint list có pagination.
