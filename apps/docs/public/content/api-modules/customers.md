# Customers API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/customers
```

Customers API quản lý hồ sơ khách hàng mua sản phẩm. Mỗi customer liên kết với một user account qua `userId`. Module này chủ yếu phục vụ Admin app khi tạo customer, tìm customer để gán owner cho product, và xem thông tin customer.

FE Admin dùng module này cho:

- Trang danh sách customers.
- Customer picker trong form assign owner/product create.
- Form tạo/sửa customer.
- Trang detail customer.

## Base route

```txt
/api/v1/customers
```

## Auth chung

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
```

## Shared contract FE nên dùng

```txt
packages/shared/src/types/customer.types.ts
packages/shared/src/constants/permissions.ts
```

## Response Customer

```ts
type CustomerResponse = {
  id: string;
  userId: string;
  customerCode: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};
```

## GET /api/v1/customers

Dùng cho: Admin customer list và customer picker.

Permission:

```txt
CUSTOMER_VIEW
```

Query params:

```ts
type ListCustomersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
```

Response:

```ts
type Response = PaginatedResponse<CustomerResponse>;
```

BE behavior:

- Nếu có `search`, BE search theo `customer_code`, `full_name`, `phone`, `email`.
- Sort theo `created_at desc`.
- Có pagination chuẩn qua `page`, `limit`.

FE triển khai chuẩn:

- Search input nên debounce 300ms.
- Customer picker nên hiển thị `fullName`, `customerCode`, `phone`, `email`.
- Empty state: phân biệt chưa có customer và search không có kết quả.
- FE dùng `meta` để render pagination.

## POST /api/v1/customers

Dùng cho: Admin create customer profile.

Permission:

```txt
CUSTOMER_CREATE
```

Body:

```ts
type CreateCustomerBody = {
  userId: string;
  customerCode?: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
};
```

Required:

- `userId`
- `fullName`

Validation:

- `userId`: UUID.
- `customerCode`: 4 đến 32 ký tự nếu gửi.
- `fullName`: 2 đến 120 ký tự.
- `phone`: 6 đến 32 ký tự nếu gửi.
- `email`: email hợp lệ nếu gửi.
- `address`: tối đa 255 ký tự nếu gửi.

BE behavior:

- Kiểm tra `userId` tồn tại.
- Một user chỉ có một customer profile.
- Nếu không gửi `customerCode`, BE tự sinh dạng `CUS-<year>-<suffix>`.
- Nếu không gửi `phone` hoặc `email`, BE fallback từ user account.

Response:

```ts
type Response = CustomerResponse;
```

Error:

- `404 User not found`.
- `409 User already has a customer profile`.
- `409 Customer code already exists`.
- `400 Could not generate a unique customer code`.

FE triển khai chuẩn:

- Form cần user picker hoặc userId input từ luồng tạo user.
- Nếu cho nhập customerCode thủ công, nên uppercase hoặc trim trước khi gửi.
- Nếu backend trả conflict user đã có customer profile, link tới customer hiện có nếu FE biết.

## GET /api/v1/customers/:id

Dùng cho: Admin customer detail.

Permission:

```txt
CUSTOMER_VIEW
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = CustomerResponse;
```

Error:

- `404 Customer not found`.

FE triển khai chuẩn:

- Detail nên hiển thị thông tin customer và các sản phẩm liên quan nếu FE có endpoint khác để lấy.
- Nếu 404, show not-found state.

## PATCH /api/v1/customers/:id

Dùng cho: Admin update customer profile.

Permission:

```txt
CUSTOMER_UPDATE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type UpdateCustomerBody = {
  fullName?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};
```

Validation:

- `fullName`: 2 đến 120 ký tự nếu gửi.
- `phone`: 6 đến 32 ký tự hoặc null.
- `email`: email hợp lệ hoặc null.
- `address`: tối đa 255 ký tự hoặc null.

Response:

```ts
type Response = CustomerResponse;
```

Error:

- `404 Customer not found`.

FE triển khai chuẩn:

- Không gửi `userId` hoặc `customerCode` trong update form vì endpoint không hỗ trợ.
- Dùng null khi muốn xoá phone/email/address.
- Sau success, update cache detail/list.

## Checklist UI Admin Customers

- List có search debounce.
- Form create bắt buộc chọn user account.
- Form update không cho sửa customerCode.
- Customer picker dùng endpoint list và hiển thị đủ customerCode/fullName/phone.
- Guard action bằng permission `CUSTOMER_CREATE` và `CUSTOMER_UPDATE`.
