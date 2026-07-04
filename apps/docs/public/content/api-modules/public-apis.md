# Public Guest APIs

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/public
```

Public APIs gom các endpoint không cần đăng nhập cho main FE/guest website. Các endpoint này phục vụ 6 chức năng chính ngoài website:

- Tra cứu hạn bảo hành bằng mã bảo hành.
- Kích hoạt bảo hành bằng mã bảo hành.
- Gửi yêu cầu bảo hành/sửa chữa.
- Tra cứu tình trạng yêu cầu bảo hành.
- Xem danh sách trạm bảo hành.
- Đọc chính sách và hướng dẫn.

## Base route

```txt
/api/v1/public
```

Các endpoint trong file này dùng `@Public()`, không gửi `Authorization`.

## GET /api/v1/public/warranties/lookup

Dùng cho: Tra cứu hạn bảo hành bằng mã bảo hành.

Query:

```ts
type Query = {
  code: string;
};
```

Response:

```ts
type Response = {
  product: {
    id: string;
    name: string;
    brand: string | null;
    model: string | null;
    serialNumber: string | null;
    warrantyCode: string;
  };
  warranty: {
    warrantyCode: string;
    startDate: string | null;
    endDate: string | null;
    status: "DRAFT" | "ACTIVE" | "EXPIRED" | "VOIDED";
  };
};
```

## POST /api/v1/public/warranties/activate-by-code

Dùng cho: Kích hoạt bảo hành bằng mã bảo hành.

Body:

```ts
type Body = {
  warrantyCode: string;
  startDate?: string;
  durationMonths?: number;
  terms?: string;
};
```

Response: `WarrantyResponse`.

## POST /api/v1/public/warranty-claims

Dùng cho: Guest gửi yêu cầu bảo hành/sửa chữa.

Body:

```ts
type Body = {
  warrantyCode: string;
  requesterName?: string;
  requesterPhone?: string;
  issueTitle: string;
  issueDetail?: string;
};
```

Response: `WarrantyClaimResponse`.

FE nên show rõ `claimCode` sau khi tạo thành công.

## GET /api/v1/public/warranty-claims/by-code/:claimCode

Dùng cho: Tra cứu tình trạng claim bằng mã claim.

Response public đã được rút gọn, không trả requester/customer:

```ts
type PublicWarrantyClaimResponse = {
  claimCode: string;
  warrantyCode: string;
  issueTitle: string;
  status: string;
  priority: string | null;
  dueAt: string | null;
  submittedAt: string;
  resolvedAt: string | null;
  product: {
    name: string;
    brand: string | null;
    model: string | null;
  } | null;
  serviceCenter: {
    name: string;
    phone: string | null;
    email: string | null;
    province: string;
    district: string | null;
    address: string;
  } | null;
};
```

## GET /api/v1/public/warranty-claims/by-warranty-code/:warrantyCode

Dùng cho: Tra cứu danh sách yêu cầu bảo hành/sửa chữa bằng mã bảo hành.

Response:

```ts
type Response = PublicWarrantyClaimResponse[];
```

Không có claim thì trả array rỗng.

## GET /api/v1/public/service-centers

Dùng cho: Trang “Trạm bảo hành”.

Query:

```ts
type Query = {
  page?: number;
  limit?: number;
  search?: string;
  province?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
```

BE luôn ép `isActive=true`, nên guest chỉ thấy trạm đang hoạt động.

Response:

```ts
type Response = PaginatedResponse<ServiceCenterResponse>;
```

## Content public APIs

Chính sách và hướng dẫn dùng module `content-pages`:

```txt
GET /api/v1/public/content-pages
GET /api/v1/public/content-pages/:slug
```

Xem thêm: API Content Pages.

## Ghi chú bảo mật

- Public claim lookup không trả `requesterName`, `requesterPhone`, `customer`, `statusHistory`, `attachments`.
- Public service centers chỉ trả trạm active.
- Các endpoint public đang chịu global throttler của API.
