# Products API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/products
```

Module Products là module trung tâm của demo bảo hành. Nó quản lý sản phẩm được bảo hành, mã sản phẩm nội bộ, mã bảo hành, serial number, trạng thái sản phẩm, thông tin chủ sở hữu hiện tại và warranty đi kèm.

FE Admin dùng module này cho:

- Trang danh sách sản phẩm.
- Form tạo/sửa sản phẩm.
- Trang chi tiết sản phẩm.
- Action xoá mềm sản phẩm.
- Action gán sản phẩm cho customer.
- Luồng tạo sản phẩm kèm warranty code và optional owner.

## Base route

```txt
/api/v1/products
```

## Auth chung

Tất cả endpoint cần login và permission tương ứng.

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
```

## Shared contract FE nên dùng

```txt
packages/shared/src/types/product.types.ts
packages/shared/src/types/warranty.types.ts
packages/shared/src/constants/permissions.ts
```

Shared type hiện có:

```ts
type ProductCategory = "CAR" | "ACCESSORY" | "SPARE_PART" | "SERVICE_PACKAGE";
type ProductStatus = "ACTIVE" | "INACTIVE" | "DELETED";
type WarrantyStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "VOIDED";
```

## Response Product

Các endpoint list/detail/create/update/delete/assign-owner đều trả product theo shape này.

```ts
type ProductResponse = {
  id: string;
  productCode: string;
  warrantyCode: string;
  serialNumber: string | null;
  name: string;
  category: "CAR" | "ACCESSORY" | "SPARE_PART" | "SERVICE_PACKAGE";
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  description: string | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  owner: {
    customerId: string;
    ownerUserId: string;
    customerCode?: string;
    fullName?: string;
    purchaseDate: string | null;
    activatedAt: string | null;
  } | null;
  warranty: {
    id: string;
    warrantyCode: string;
    startDate: string | null;
    endDate: string | null;
    durationMonths: number;
    status: "DRAFT" | "ACTIVE" | "EXPIRED" | "VOIDED";
    terms: string | null;
  } | null;
};
```

## GET /api/v1/products

Dùng cho: Admin product list.

Permission:

```txt
PRODUCT_VIEW
```

Query params:

```ts
type ListProductsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: "CAR" | "ACCESSORY" | "SPARE_PART" | "SERVICE_PACKAGE";
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
  warrantyStatus?: "DRAFT" | "ACTIVE" | "EXPIRED" | "VOIDED";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
```

Response:

```ts
type Response = PaginatedResponse<ProductResponse>;
```

BE behavior:

- Chỉ trả product chưa bị xoá mềm: `deleted_at = null`.
- `search` match theo `name`, `product_code`, `warranty_code`, `serial_number`, `brand`, `model`, hoặc tên customer owner hiện tại.
- Sort theo `created_at desc`.
- Có pagination chuẩn qua `page`, `limit`.

FE triển khai chuẩn:

- Search input nên debounce khoảng 300ms.
- Filter category/status/warrantyStatus dùng select.
- FE dùng `meta` để render pagination.
- Empty state tách 2 case: chưa có sản phẩm và search/filter không có kết quả.
- Table nên hiển thị tối thiểu: name, productCode, warrantyCode, serialNumber, category, owner.fullName, warranty.status, status.

## POST /api/v1/products

Dùng cho: Admin create product.

Permission:

```txt
PRODUCT_CREATE
```

Body:

```ts
type CreateProductBody = {
  name: string;
  category: "CAR" | "ACCESSORY" | "SPARE_PART" | "SERVICE_PACKAGE";
  brand?: string;
  model?: string;
  manufactureYear?: number;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
  serialNumber?: string;
  autoGenerateWarrantyCode?: boolean;
  warrantyCode?: string;
  customerId?: string;
  purchaseDate?: string;
  activatedAt?: string;
  durationMonths?: number;
  warrantyTerms?: string;
};
```

Required fields:

- `name`
- `category`

Validation:

- `name`: 2 đến 160 ký tự.
- `brand`: tối đa 80 ký tự.
- `model`: tối đa 80 ký tự.
- `manufactureYear`: 1900 đến 2100.
- `description`: tối đa 1000 ký tự.
- `serialNumber`: 1 đến 64 ký tự.
- `warrantyCode`: 6 đến 64 ký tự, chỉ chữ/số/dấu gạch ngang.
- `customerId`: UUID nếu gửi.
- `purchaseDate`, `activatedAt`: ISO date string nếu gửi.
- `durationMonths`: 1 đến 120, default BE là `36`.
- `warrantyTerms`: tối đa 2000 ký tự.

BE behavior:

- Tự sinh `productCode` dạng `PRD-<year>-<suffix>`.
- Nếu `autoGenerateWarrantyCode !== false` và không gửi `warrantyCode`, BE tự sinh mã dạng `WM-<year>-<suffix>`.
- Nếu `autoGenerateWarrantyCode === false`, FE bắt buộc gửi `warrantyCode`.
- Luôn tạo warranty record cùng product.
- Nếu gửi `customerId`, BE tạo ownership hiện tại.
- Nếu có `activatedAt` hoặc `purchaseDate`, warranty sẽ có `startDate`; nếu không warranty ở trạng thái `DRAFT`.
- Nếu `serialNumber` đã tồn tại, BE trả conflict.

Response:

```ts
type Response = ProductResponse;
```

Error FE cần xử lý:

- `400 Warranty code is required`: user tắt auto generate nhưng chưa nhập warrantyCode.
- `400 Warranty code format is invalid`: mã sai format.
- `400 Could not generate a unique product code`: lỗi hiếm khi auto generate productCode.
- `400 Could not generate a unique warranty code`: lỗi hiếm khi auto generate warrantyCode.
- `404 Customer not found`: customerId không tồn tại.
- `409 Serial number already exists`: serialNumber bị trùng.
- `409 Warranty code already exists`: warrantyCode bị trùng.

FE triển khai chuẩn:

- Form nên có toggle “Auto generate warranty code”.
- Nếu toggle bật, disable input warrantyCode.
- Nếu toggle tắt, require input warrantyCode và uppercase trước khi submit.
- Nếu chọn customer, nên dùng customer picker lấy từ Customers API.
- Sau create success, redirect detail hoặc refresh product list.

## GET /api/v1/products/:id

Dùng cho: Admin product detail.

Permission:

```txt
PRODUCT_VIEW
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = ProductResponse;
```

BE behavior:

- Nếu product không tồn tại hoặc đã soft delete, trả `404 Product not found`.

FE triển khai chuẩn:

- Detail page nên hiển thị product info, owner info, warranty info.
- Nếu `owner === null`, show CTA “Assign owner”.
- Nếu `warranty.status === DRAFT`, show CTA “Activate warranty”.
- Nếu 404, show not found state và link quay lại list.

## PATCH /api/v1/products/:id

Dùng cho: Admin edit product.

Permission:

```txt
PRODUCT_UPDATE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type UpdateProductBody = {
  name?: string;
  category?: "CAR" | "ACCESSORY" | "SPARE_PART" | "SERVICE_PACKAGE";
  brand?: string | null;
  model?: string | null;
  manufactureYear?: number | null;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
  serialNumber?: string | null;
};
```

Response:

```ts
type Response = ProductResponse;
```

BE behavior:

- Không cho update product đã soft delete.
- Nếu đổi `serialNumber` sang giá trị đã tồn tại ở product khác, trả conflict.
- Endpoint này không update warrantyCode, owner hay warranty fields.

Error FE cần xử lý:

- `404 Product not found`.
- `409 Serial number already exists`.

FE triển khai chuẩn:

- Edit form chỉ expose các field endpoint hỗ trợ.
- Không gửi warrantyCode trong form update product.
- Nếu cần đổi owner, dùng endpoint assign-owner.
- Nếu cần activate warranty, dùng Warranties API.

## DELETE /api/v1/products/:id

Dùng cho: Admin soft delete product.

Permission:

```txt
PRODUCT_DELETE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = ProductResponse;
```

BE behavior:

- Set `status = DELETED`.
- Set `deletedAt`.
- Product bị xoá mềm sẽ không xuất hiện trong list/detail.

Error:

- `404 Product not found` nếu không tồn tại hoặc đã delete.

FE triển khai chuẩn:

- Nên có confirm dialog.
- Sau success, remove item khỏi table hoặc refetch list.
- Detail page sau delete nên redirect về list.

## POST /api/v1/products/:id/assign-owner

Dùng cho: Admin gán hoặc chuyển chủ sở hữu hiện tại.

Permission:

```txt
PRODUCT_ASSIGN_OWNER
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type AssignProductOwnerBody = {
  customerId: string;
  purchaseDate?: string;
  activatedAt?: string;
};
```

Response:

```ts
type Response = ProductResponse;
```

BE behavior:

- Kiểm tra product tồn tại và chưa bị delete.
- Kiểm tra customer tồn tại.
- Đóng ownership hiện tại bằng `is_current_owner = false` và set `ended_at`.
- Tạo ownership mới với `is_current_owner = true`.
- Không tự activate warranty ở endpoint này.

Error:

- `404 Product not found`.
- `404 Customer not found`.

FE triển khai chuẩn:

- Customer picker nên search bằng Customers API.
- Sau success, refresh detail để owner mới hiển thị.
- Nếu user nhập `activatedAt`, UI vẫn nên kiểm tra warranty status riêng vì endpoint này chỉ cập nhật ownership activation date.

## Checklist UI Admin Products

- List có search/filter/loading/empty/error.
- Create form có toggle auto-generate warrantyCode.
- Detail tách rõ product/owner/warranty.
- Delete có confirm.
- Assign owner là modal/drawer riêng, không trộn vào update product.
- Permission guard ở UI: hide/disable action nếu thiếu permission.
