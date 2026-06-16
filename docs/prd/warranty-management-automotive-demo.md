# PRD & Architecture: Demo Hệ Thống Quản Lý Bảo Hành Ô Tô

## 1. Bối Cảnh

Dự án cần được chuyển hướng từ base booking sang hệ thống quản lý bảo hành, tập trung trước vào sản phẩm ô tô và các sản phẩm liên quan đến ô tô. Khách hàng cần một bản demo có thể thể hiện được các nghiệp vụ cốt lõi:

- Admin quản lý danh mục sản phẩm.
- Mỗi sản phẩm có một mã định danh để tra cứu bảo hành.
- Mã định danh có thể tự sinh hoặc admin tự nhập.
- Khách hàng có thể tra cứu thông tin sản phẩm/bảo hành, nhưng chỉ khi họ đúng là người mua hoặc người được gán với sản phẩm đó.

Mục tiêu của demo là chứng minh luồng nghiệp vụ, mô hình dữ liệu và quyền truy cập. Không cần đầy đủ tất cả tính năng enterprise ngay từ đầu.

## 2. Mục Tiêu MVP Demo

1. Xây dựng admin dashboard để thêm, sửa, xóa, xem danh sách sản phẩm.
2. Mỗi sản phẩm có mã tra cứu duy nhất, gọi là `warrantyCode` hoặc `serialNumber`.
3. Admin có thể chọn:
   - Tự động sinh mã.
   - Tự nhập mã riêng khi sản phẩm đã có serial/VIN/mã nhà sản xuất.
4. Gán sản phẩm cho khách hàng mua sản phẩm.
5. Khách hàng đăng nhập vào web và chỉ xem được sản phẩm thuộc về mình.
6. Khách hàng có thể tra cứu sản phẩm bằng mã, nhưng hệ thống phải kiểm tra quan hệ sở hữu/mua hàng trước khi trả kết quả.
7. Hiển thị trang chi tiết bảo hành có thông tin sản phẩm, ngày mua, thời hạn bảo hành, trạng thái bảo hành.

## 3. Không Nằm Trong Demo Đầu Tiên

- Xử lý thanh toán.
- Tích hợp nhà sản xuất, đại lý bên ngoài hoặc DMS.
- Quản lý tồn kho chi tiết.
- Ký số/chứng thư bảo hành.
- Lịch hẹn sửa chữa phức tạp.
- Ứng dụng mobile native.
- Phân quyền đa tenant phức tạp.

Những phần này có thể mở rộng sau khi demo được chấp nhận.

## 4. Vai Trò Người Dùng

### 4.1 Admin

Admin là nhân sự nội bộ hoặc đại lý có quyền quản lý dữ liệu. Trong demo, admin cần có thể:

- Tạo sản phẩm mới.
- Cập nhật thông tin sản phẩm.
- Xóa mềm sản phẩm khi nhập sai hoặc ngừng quản lý.
- Gán sản phẩm cho khách hàng.
- Tìm kiếm sản phẩm theo tên, mã, biển số, VIN/serial, khách hàng.
- Xem trạng thái bảo hành của sản phẩm.

### 4.2 Khách Hàng

Khách hàng là người mua sản phẩm. Trong demo, khách hàng cần có thể:

- Đăng nhập.
- Xem danh sách sản phẩm của mình.
- Nhập mã tra cứu để xem sản phẩm của mình.
- Xem thời hạn và trạng thái bảo hành.

Nếu khách hàng nhập mã của sản phẩm không thuộc về mình, hệ thống không trả về thông tin chi tiết.

## 5. Luồng Nghiệp Vụ Chính

### 5.1 Admin Tạo Sản Phẩm

1. Admin vào `Admin > Products`.
2. Bấm `Create Product`.
3. Nhập thông tin:
   - Tên sản phẩm.
   - Loại sản phẩm: ô tô, phụ kiện, phụ tùng, gói dịch vụ.
   - Hãng/brand.
   - Model.
   - Năm sản xuất.
   - VIN/serial number nếu có.
   - Warranty code: tự sinh hoặc tự nhập.
   - Ngày bán/ngày kích hoạt bảo hành.
   - Thời hạn bảo hành.
   - Khách hàng sở hữu.
4. Hệ thống validate mã không được trùng.
5. Hệ thống lưu sản phẩm và gán quyền tra cứu cho khách hàng.

### 5.2 Admin Sửa/Xóa Sản Phẩm

1. Admin vào chi tiết sản phẩm.
2. Sửa thông tin sản phẩm hoặc thông tin bảo hành.
3. Nếu xóa, nên dùng xóa mềm (`deletedAt`) để không mất lịch sử bảo hành.
4. Sản phẩm bị xóa mềm không hiện trong tra cứu khách hàng.

### 5.3 Khách Hàng Tra Cứu Sản Phẩm

1. Khách hàng đăng nhập vào web.
2. Nhập mã tra cứu sản phẩm.
3. API tìm sản phẩm theo mã.
4. API kiểm tra sản phẩm có thuộc về khách hàng hiện tại không.
5. Nếu đúng, trả về thông tin bảo hành.
6. Nếu sai, trả về thông báo chung: "Không tìm thấy sản phẩm phù hợp với tài khoản này."

Không nên báo rõ "mã này tồn tại nhưng không thuộc về bạn" vì có thể làm lộ dữ liệu.

## 6. Mô Hình Dữ Liệu Đề Xuất

### 6.1 `users`

Dùng cho cả admin và khách hàng.

Trường chính:

- `id`
- `email`
- `phone`
- `fullName`
- `role`: `admin`, `customer`
- `createdAt`
- `updatedAt`

Trong demo có thể tận dụng module user/auth có sẵn nếu repo đã có.

### 6.2 `customers`

Hồ sơ khách hàng mua sản phẩm. Nếu muốn đơn giản, có thể dùng trực tiếp `users` với role `customer`. Nếu muốn đúng nghiệp vụ hơn, tách `customers`.

Trường chính:

- `id`
- `userId`
- `customerCode`
- `fullName`
- `phone`
- `email`
- `address`
- `createdAt`
- `updatedAt`

Khuyến nghị cho demo: tạo `customers` riêng nhưng liên kết với `users`. Cách này dễ mở rộng khi một khách hàng có nhiều liên hệ, nhiều xe, nhiều hồ sơ mua hàng.

### 6.3 `products`

Bảng sản phẩm được bảo hành.

Trường chính:

- `id`
- `productCode`: mã nội bộ tự sinh.
- `warrantyCode`: mã tra cứu bảo hành, unique.
- `serialNumber`: serial/VIN/mã nhà sản xuất, optional nhưng unique nếu có.
- `name`
- `category`: `car`, `accessory`, `spare_part`, `service_package`
- `brand`
- `model`
- `manufactureYear`
- `description`
- `status`: `active`, `inactive`, `deleted`
- `createdAt`
- `updatedAt`
- `deletedAt`

Với ô tô, `serialNumber` có thể dùng làm VIN. Với phụ kiện/phụ tùng, đây có thể là serial nhà sản xuất.

### 6.4 `product_ownerships`

Bảng gán sản phẩm với khách hàng. Tách bảng này để sau này hỗ trợ chuyển nhượng, đổi chủ sở hữu, hoặc lịch sử mua bán.

Trường chính:

- `id`
- `productId`
- `customerId`
- `ownerUserId`
- `purchaseDate`
- `activatedAt`
- `endedAt`
- `isCurrentOwner`
- `createdAt`
- `updatedAt`

Quy tắc:

- Mỗi sản phẩm chỉ có một owner hiện tại tại một thời điểm.
- Khách hàng chỉ tra cứu được sản phẩm nếu `ownerUserId` bằng user đang đăng nhập và `isCurrentOwner = true`.

### 6.5 `warranties`

Thông tin bảo hành của sản phẩm.

Trường chính:

- `id`
- `productId`
- `warrantyCode`
- `startDate`
- `endDate`
- `durationMonths`
- `status`: `draft`, `active`, `expired`, `voided`
- `terms`
- `createdAt`
- `updatedAt`

Có thể để `warrantyCode` ở `products` hoặc `warranties`. Cho demo, nên để `warrantyCode` trong `products` và duplicate/index trong `warranties` nếu cần tra cứu nhanh. Nếu muốn sạch hơn, chỉ để trong `warranties` và tạo unique index.

### 6.6 `warranty_claims` Sau Demo

Chưa cần làm ngay, nhưng nên chuẩn bị module sau:

- Khách tạo yêu cầu bảo hành.
- Admin tiếp nhận.
- Cập nhật trạng thái sửa chữa/đổi trả.

Trạng thái gợi ý:

- `submitted`
- `reviewing`
- `approved`
- `rejected`
- `in_service`
- `completed`

## 7. Kiến Trúc Module Backend

Theo kiến trúc hiện tại của repo, mỗi module backend nên theo luồng:

`controller -> use case -> repository -> database`

### 7.1 Module Cần Có Cho Demo

#### `auth`

Nếu đã có thì tận dụng. Cần hỗ trợ:

- Đăng nhập admin.
- Đăng nhập khách hàng.
- Guard theo role.

#### `users`

Quản lý tài khoản admin/khách hàng.

#### `customers`

Quản lý hồ sơ khách hàng.

Use cases:

- `CreateCustomerUseCase`
- `UpdateCustomerUseCase`
- `FindCustomerByIdUseCase`
- `ListCustomersUseCase`

#### `products`

Quản lý sản phẩm.

Use cases:

- `CreateProductUseCase`
- `UpdateProductUseCase`
- `SoftDeleteProductUseCase`
- `ListProductsUseCase`
- `GetProductDetailUseCase`
- `GenerateWarrantyCodeUseCase`

#### `warranties`

Quản lý và tra cứu bảo hành.

Use cases:

- `ActivateWarrantyUseCase`
- `GetWarrantyByProductUseCase`
- `LookupWarrantyForCustomerUseCase`
- `ExpireWarrantyUseCase` sau demo có thể chạy cron.

### 7.2 Cấu Trúc Thư Mục Đề Xuất

```text
apps/api/src/modules/products/
  dto/
  repository/
  tests/
  use-cases/
  products.controller.ts
  products.module.ts

apps/api/src/modules/customers/
  dto/
  repository/
  tests/
  use-cases/
  customers.controller.ts
  customers.module.ts

apps/api/src/modules/warranties/
  dto/
  repository/
  tests/
  use-cases/
  warranties.controller.ts
  warranties.module.ts
```

## 8. API Đề Xuất Cho Demo

### 8.1 Admin APIs

```text
GET    /api/v1/admin/products
POST   /api/v1/admin/products
GET    /api/v1/admin/products/:id
PATCH  /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id

GET    /api/v1/admin/customers
POST   /api/v1/admin/customers
GET    /api/v1/admin/customers/:id
PATCH  /api/v1/admin/customers/:id

POST   /api/v1/admin/products/:id/assign-customer
POST   /api/v1/admin/products/:id/activate-warranty
```

### 8.2 Customer APIs

```text
GET  /api/v1/me/products
POST /api/v1/me/warranty-lookup
GET  /api/v1/me/products/:id/warranty
```

Payload tra cứu:

```json
{
  "code": "WM-2026-8F3K2A"
}
```

Response thành công:

```json
{
  "product": {
    "id": "product_id",
    "name": "Toyota Camry 2.5Q",
    "brand": "Toyota",
    "model": "Camry",
    "serialNumber": "VIN123456789"
  },
  "warranty": {
    "warrantyCode": "WM-2026-8F3K2A",
    "startDate": "2026-06-14",
    "endDate": "2029-06-14",
    "status": "active"
  }
}
```

Response khi không được phép hoặc không thấy:

```json
{
  "message": "Không tìm thấy sản phẩm phù hợp với tài khoản này."
}
```

## 9. Quy Tắc Sinh Mã

Mã tra cứu nên ngắn gọn, dễ đọc, nhưng khó đoán.

Định dạng đề xuất:

```text
WM-YYYY-XXXXXX
```

Ví dụ:

```text
WM-2026-8F3K2A
```

Quy tắc:

- `WM`: Warranty Management.
- `YYYY`: năm tạo/kích hoạt.
- `XXXXXX`: chuỗi random uppercase, bỏ ký tự dễ nhầm như O/0/I/1 nếu cần.
- Tạo unique index trong database.
- Khi random trùng, retry tối đa 5 lần.
- Admin được nhập mã riêng, nhưng phải validate:
  - Không rỗng.
  - Không trùng.
  - Độ dài hợp lý, ví dụ 6-64 ký tự.
  - Chỉ cho phép chữ, số, dấu gạch ngang.

## 10. Bảo Mật Và Phân Quyền

### 10.1 Nguyên Tắc Quan Trọng

Tra cứu theo mã không được phép bỏ qua danh tính người dùng. Mã tra cứu không nên được xem là password.

API customer phải luôn lọc theo:

- User đang đăng nhập.
- Quan hệ ownership hiện tại.
- Trạng thái sản phẩm chưa bị xóa.

### 10.2 Admin

Admin có quyền xem và quản lý toàn bộ sản phẩm trong demo.

Sau demo có thể thêm:

- Admin đại lý chỉ xem dữ liệu của đại lý mình.
- Super admin xem toàn hệ thống.
- Audit log cho hành động sửa/xóa/gán sản phẩm.

### 10.3 Customer

Customer chỉ xem được:

- Sản phẩm gán với họ.
- Bảo hành của sản phẩm gán với họ.

Nếu customer nhập mã đúng nhưng không thuộc về họ, response nên giống trường hợp không tồn tại.

## 11. Kiến Trúc Frontend

### 11.1 Admin App

Demo admin nên có các màn hình:

1. `Products List`
   - Bảng sản phẩm.
   - Tìm kiếm theo mã, tên, VIN/serial, khách hàng.
   - Filter theo category, status, warranty status.
2. `Create/Edit Product`
   - Form thông tin sản phẩm.
   - Toggle: tự sinh mã / nhập mã thủ công.
   - Select khách hàng.
   - Cấu hình thời hạn bảo hành.
3. `Product Detail`
   - Thông tin sản phẩm.
   - Thông tin owner.
   - Thông tin bảo hành.
   - Hành động sửa, xóa mềm, kích hoạt bảo hành.
4. `Customers`
   - Danh sách khách hàng.
   - Chi tiết khách hàng kèm danh sách sản phẩm đang sở hữu.

### 11.2 Web App Cho Khách Hàng

Demo web nên có các màn hình:

1. `My Products`
   - Danh sách sản phẩm khách đang sở hữu.
2. `Warranty Lookup`
   - Input nhập mã tra cứu.
   - Kết quả bảo hành nếu hợp lệ.
3. `Warranty Detail`
   - Tên sản phẩm.
   - Mã bảo hành.
   - Ngày bắt đầu/kết thúc.
   - Trạng thái: còn hạn, hết hạn, bị hủy.

## 12. Kế Hoạch Triển Khai Demo

### Giai Đoạn 1: Nền Tảng Dữ Liệu Và API

1. Thêm schema Prisma cho `customers`, `products`, `product_ownerships`, `warranties`.
2. Tạo module `customers`.
3. Tạo module `products`.
4. Tạo module `warranties`.
5. Viết use-case test cho các rule quan trọng:
   - Tạo mã tự động không trùng.
   - Admin nhập mã bị trùng thì fail.
   - Customer không tra cứu được sản phẩm của người khác.

### Giai Đoạn 2: Admin Demo

1. Tạo trang danh sách sản phẩm.
2. Tạo form thêm/sửa sản phẩm.
3. Gán sản phẩm với khách hàng.
4. Hiển thị chi tiết sản phẩm và bảo hành.

### Giai Đoạn 3: Customer Demo

1. Tạo trang danh sách sản phẩm của tôi.
2. Tạo trang tra cứu bảo hành.
3. Hiển thị trang chi tiết bảo hành.
4. Demo case thành công và case bị từ chối do không phải chủ sở hữu.

### Giai Đoạn 4: Dữ Liệu Mẫu

Seed dữ liệu:

- 1 admin.
- 2 khách hàng.
- 3 sản phẩm:
  - 1 xe gán cho khách A.
  - 1 phụ kiện gán cho khách A.
  - 1 xe gán cho khách B.
- Demo khách A tra cứu sản phẩm của A thành công.
- Demo khách A tra cứu mã của khách B bị từ chối.

## 13. Thứ Tự Ưu Tiên Nếu Cần Demo Nhanh

Nếu chỉ có ít thời gian, làm theo thứ tự:

1. Prisma schema + seed data.
2. API admin create/list/detail product.
3. API customer lookup có check owner.
4. Admin UI list/create product.
5. Web UI lookup warranty.
6. Polish UI sau.

Phần bắt buộc để demo có giá trị là rule: "chỉ người mua mới tra cứu được sản phẩm".

## 14. Rủi Ro Và Cách Xử Lý

### 14.1 Mã Tra Cứu Bị Đoán

Rủi ro: Nếu mã quá ngắn, người ngoài có thể thử nhiều mã.

Cách xử lý:

- Mã random đủ dài.
- Rate limit endpoint tra cứu.
- Bắt buộc đăng nhập.
- Không trả thông báo phân biệt tồn tại/không có quyền.

### 14.2 Trùng Mã Khi Admin Nhập Thủ Công

Cách xử lý:

- Unique index.
- Validate trước khi lưu.
- Trả lời lỗi rõ ràng cho admin.

### 14.3 Dữ Liệu Owner Thay Đổi

Cách xử lý:

- Dùng `product_ownerships` thay vì chỉ lưu `customerId` trên product.
- Có `isCurrentOwner` và `endedAt`.

### 14.4 Xóa Sản Phẩm Làm Mất Lịch Sử

Cách xử lý:

- Dùng xóa mềm.
- Không xóa warranty/ownership history.

## 15. Định Hướng Mở Rộng Sau Demo

1. Warranty claims: khách tạo yêu cầu bảo hành.
2. Service appointments: đặt lịch sửa chữa/kiểm tra.
3. Dealer management: đại lý, chi nhánh, nhân viên.
4. Audit log: theo dõi ai sửa thông tin bảo hành.
5. Import Excel danh sách sản phẩm/khách hàng.
6. QR code cho warranty code.
7. Public verification có cơ chế giới hạn thông tin, nếu khách hàng muốn quét QR không cần login.
8. Notification qua email/SMS/Zalo khi bảo hành sắp hết hạn.

## 16. Kết Luận Đề Xuất

Cho bản demo, nên tập trung vào module `products`, `customers`, `warranties` và rule ownership. Kiến trúc nên giữ đơn giản nhưng đúng ranh giới:

- Admin quản lý sản phẩm và gán owner.
- Customer chỉ xem sản phẩm của mình.
- Warranty code là mã tra cứu, không phải cơ chế bảo mật duy nhất.
- Backend use case phải là nơi enforce quyền truy cập, không đưa logic này lên frontend.

Nếu làm đúng hướng này, demo sẽ đủ thuyết phục khách hàng và vẫn dễ mở rộng sang claim bảo hành, lịch sửa chữa, đại lý và QR code sau này.
