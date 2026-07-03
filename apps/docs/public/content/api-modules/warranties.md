# Warranties API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/warranties
```

Warranties API quản lý kích hoạt và tra cứu bảo hành. Module này có hai nhóm flow:

- Admin flow: tra cứu warranty theo mã, kích hoạt warranty theo product hoặc warrantyCode.
- Customer flow: customer xem sản phẩm thuộc sở hữu của mình và tra cứu bảo hành nhưng BE enforce ownership.

Rule quan trọng nhất: Customer không được xem sản phẩm chỉ vì biết warrantyCode. BE luôn kiểm tra ownership hiện tại.

## Base routes

Controller không có base path riêng, endpoint nằm dưới nhiều route:

```txt
/api/v1/warranties
/api/v1/products
/api/v1/me
```

## Auth chung

Admin:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
```

Customer:

```txt
Authorization: Bearer <access_token>
x-auth-context: client
```

## Shared contract FE nên dùng

```txt
packages/shared/src/types/warranty.types.ts
packages/shared/src/types/product.types.ts
packages/shared/src/constants/permissions.ts
```

## Response Warranty

```ts
type WarrantyResponse = {
  id: string;
  productId: string;
  warrantyCode: string;
  startDate: string | null;
  endDate: string | null;
  durationMonths: number;
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "VOIDED";
  terms: string | null;
  createdAt: string;
  updatedAt: string;
};
```

## Response Warranty Lookup

```ts
type WarrantyLookupResult = {
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

## GET /api/v1/warranties/lookup

Dùng cho: Admin tra cứu nhanh warranty theo mã.

Permission:

```txt
WARRANTY_VIEW
```

Query params:

```ts
type LookupWarrantyQuery = {
  code: string;
};
```

Validation:

- `code`: 6 đến 64 ký tự.
- Chỉ chữ, số và dấu gạch ngang.

Response:

```ts
type Response = WarrantyLookupResult;
```

BE behavior:

- Trim và uppercase code.
- Tìm product chưa bị delete có `warranty_code = code`.
- Không kiểm tra ownership vì đây là admin endpoint.

Error:

- `404 Warranty not found`.

FE triển khai chuẩn:

- Search box nên uppercase input.
- Nếu 404, hiển thị “Không tìm thấy bảo hành” thay vì generic error.
- Không dùng endpoint này ở customer web.

## POST /api/v1/warranties/activate-by-code

Dùng cho: Admin activate warranty bằng warrantyCode.

Permission:

```txt
WARRANTY_ACTIVATE
```

Body:

```ts
type ActivateWarrantyByCodeBody = {
  warrantyCode: string;
  startDate?: string;
  durationMonths?: number;
  terms?: string;
};
```

Validation:

- `warrantyCode`: 6 đến 64 ký tự, chữ/số/gạch ngang.
- `startDate`: ISO date string nếu gửi.
- `durationMonths`: 1 đến 120 nếu gửi.
- `terms`: tối đa 2000 ký tự.

Response:

```ts
type Response = WarrantyResponse;
```

BE behavior:

- Tìm product chưa delete theo warrantyCode.
- Nếu không gửi `startDate`, dùng ngày hiện tại.
- Nếu không gửi `durationMonths`, dùng duration hiện tại của warranty.
- Set status warranty thành `ACTIVE`.
- Tính `endDate = startDate + durationMonths`.
- Update ownership hiện tại nếu `activated_at` đang null.

Error:

- `404 Warranty not found`.

FE triển khai chuẩn:

- Dùng cho action “Activate by code” trong Admin.
- Sau success, refetch product/warranty detail.
- Nếu user không nhập startDate, UI có thể nói “BE sẽ dùng hôm nay”.

## POST /api/v1/products/:id/activate-warranty

Dùng cho: Admin activate warranty từ product detail.

Permission:

```txt
WARRANTY_ACTIVATE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type ActivateWarrantyBody = {
  startDate?: string;
  durationMonths?: number;
  terms?: string;
};
```

Response:

```ts
type Response = WarrantyResponse;
```

BE behavior:

- Tìm warranty theo `product_id`.
- Nếu không gửi startDate, dùng ngày hiện tại.
- Set warranty status `ACTIVE`.
- Update current ownership activation date nếu đang null.

Error:

- `404 Warranty not found`.

FE triển khai chuẩn:

- Dùng ở product detail khi warranty đang `DRAFT`.
- Modal nên có startDate, durationMonths, terms.
- Sau success, refetch product detail.

## GET /api/v1/products/:id/warranty

Dùng cho: Admin xem warranty của product.

Permission:

```txt
WARRANTY_VIEW
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = WarrantyResponse;
```

Error:

- `404 Warranty not found`.

FE triển khai chuẩn:

- Có thể dùng nếu product detail không đủ warranty data.
- Nếu 404, show “Sản phẩm chưa có warranty record” nhưng hiện create product luôn tạo warranty.

## GET /api/v1/me/products

Dùng cho: Customer web “My Products”.

Permission:

```txt
PRODUCT_VIEW
```

Params/query/body:

```ts
type Params = {};
type Query = {};
type Body = never;
```

Response:

```ts
type Response = ProductResponse[];
```

BE behavior:

- Lấy `ownerUserId` từ token.
- Chỉ trả products chưa delete mà user hiện tại là current owner.
- Include owner và warranty như ProductResponse.
- Sort theo `created_at desc`.

FE triển khai chuẩn:

- Customer web dùng endpoint này cho danh sách sản phẩm.
- Không dùng Admin products list cho customer.
- Empty state: “Bạn chưa có sản phẩm được gán bảo hành”.

## POST /api/v1/me/warranty-lookup

Dùng cho: Customer tra cứu warranty theo mã.

Permission:

```txt
WARRANTY_LOOKUP_OWN
```

Body:

```ts
type LookupWarrantyBody = {
  code: string;
};
```

Response:

```ts
type Response = WarrantyLookupResult;
```

BE behavior:

- Trim và uppercase code.
- Tìm product chưa delete có warrantyCode trùng.
- Bắt buộc product phải có ownership hiện tại thuộc user trong token.
- Nếu không match, trả cùng một not-found message để không leak sản phẩm của người khác.

Error:

- `404 Không tìm thấy sản phẩm phù hợp với tài khoản này.`

FE triển khai chuẩn:

- Đây là endpoint customer lookup chính.
- Khi 404, hiển thị thông báo trung tính: “Không tìm thấy sản phẩm phù hợp với tài khoản này”.
- Không nói “mã tồn tại nhưng không thuộc bạn”.
- Sau success, route tới warranty detail hoặc render result card.

## GET /api/v1/me/products/:id/warranty

Dùng cho: Customer warranty detail của sản phẩm thuộc mình.

Permission:

```txt
WARRANTY_VIEW
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = WarrantyLookupResult;
```

BE behavior:

- Lấy product theo id.
- Bắt buộc current owner là user trong token.
- Nếu không match, trả not-found trung tính.

Error:

- `404 Không tìm thấy sản phẩm phù hợp với tài khoản này.`

FE triển khai chuẩn:

- Dùng cho customer warranty detail page.
- Nếu 404, redirect về My Products hoặc show no-access/not-found state.

## Checklist FE Warranties

- Admin dùng endpoint admin; customer dùng endpoint `/me/*`.
- Customer lookup không được gọi `/warranties/lookup`.
- UI không leak ownership error.
- Product detail Admin chỉ show activate action khi user có `WARRANTY_ACTIVATE`.
- Customer detail nên show status, startDate, endDate, warrantyCode, product brand/model/serialNumber.
