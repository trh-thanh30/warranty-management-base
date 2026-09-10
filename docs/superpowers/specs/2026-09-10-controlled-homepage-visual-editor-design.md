# Controlled Homepage Visual Editor

## Mục tiêu

Cho phép quản trị viên chỉnh trực tiếp từng đoạn chữ trên homepage trong một trình chỉnh sửa trực quan giống WordPress. Nội dung được xem theo đúng giao diện Web, hỗ trợ desktop/tablet/mobile, lưu nháp và chỉ thay đổi website công khai sau khi xuất bản.

## Phạm vi

- Homepage thực tế là route `apps/web/app/[locale]/page.tsx`, hiện render giao diện được đặt tên `AboutView`.
- Giữ nguyên tám section và thứ tự hiện tại:
  1. Hero
  2. Câu chuyện thương hiệu
  3. Công nghệ cốt lõi
  4. Cột mốc phát triển
  5. Tầm nhìn và giá trị
  6. Mạng lưới đại lý
  7. Đánh giá đối tác
  8. CTA hợp tác đại lý
- Cho phép chỉnh riêng từng đoạn text và các ảnh đã được đăng ký.
- Không cho thêm, xóa, nhân bản, kéo thả hoặc thay đổi bố cục section.
- Không cho nhập HTML hoặc CSS tùy ý.

## Trải nghiệm quản trị

Tab **Trang chủ** trong màn hình cấu hình website mở một Puck editor toàn màn hình hoặc gần toàn màn hình. Canvas hiển thị homepage thật. Khi chọn một đoạn chữ, quản trị viên có thể nhập trực tiếp trên canvas hoặc dùng sidebar để thay đổi nội dung và style.

Style được giới hạn bởi design system:

- Font: danh sách font đã phê duyệt.
- Kích thước: `S`, `M`, `L`, `XL`, `2XL`.
- Màu: token thương hiệu, không nhập mã màu tự do.
- Căn lề: trái, giữa, phải.
- Định dạng: bold và italic.

Thanh công cụ có chuyển đổi desktop/tablet/mobile, lưu nháp và xuất bản. Không hiển thị component palette vì quản trị viên không được thêm section.

## Kiến trúc

### Component registry

Tạo registry homepage dùng chung về contract giữa Admin editor và Web renderer. Mỗi section có một component key ổn định và props được định kiểu. Puck dùng registry này để dựng canvas; Web dùng dữ liệu cùng schema để dựng trang công khai.

Do Admin và Web là hai ứng dụng Next.js riêng, tạo package mới `packages/homepage` chứa component trình bày thuần React, schema props và registry section. Package này không phụ thuộc router, `next-intl`, API client, auth hay provider riêng của Admin/Web. Các hành động như Link, hotline, asset URL và dữ liệu bản đồ được truyền vào qua props hoặc adapter của từng app. Không sao chép hai bộ component độc lập.

### Puck editor

Admin tích hợp `@measured/puck` với:

- Dữ liệu khởi tạo từ website draft.
- `contentEditable` cho text và textarea.
- Field tùy chỉnh cho style preset và asset picker.
- Viewport desktop/tablet/mobile.
- Permissions tắt add, delete, duplicate và drag/reorder.
- `onChange` chỉ cập nhật state draft tại Admin.
- Nút lưu/publish gọi API revision hiện có.

### Web renderer

Homepage công khai chỉ đọc bản published. Renderer nhận schema đã resolve với fallback mặc định, sau đó render tám section theo thứ tự cố định. Web không tải Puck editor runtime; chỉ dùng renderer components và dữ liệu đã lưu.

## Mô hình dữ liệu

Mỗi text chỉnh được lưu dưới dạng semantic content cộng style preset:

```ts
type EditableText = {
  content: string;
  font: "heading" | "body";
  size: "s" | "m" | "l" | "xl" | "2xl";
  color: "default" | "muted" | "primary" | "inverse";
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
};
```

Schema homepage vẫn có key theo từng section để migration và fallback ổn định. Không lưu class Tailwind, HTML hoặc CSS từ người dùng.

Ảnh lưu bằng asset ID hiện có. API resolve asset thành URL khi trả draft preview hoặc dữ liệu public.

## Luồng dữ liệu

1. Admin tải website draft.
2. Adapter chuyển schema domain sang Puck data.
3. Quản trị viên chọn và sửa trực tiếp element.
4. Puck cập nhật state cục bộ, canvas phản ánh ngay.
5. Lưu nháp chuyển Puck data về schema domain và gọi endpoint draft hiện có.
6. Xuất bản chạy validation rồi tạo published revision.
7. Homepage `/vi` và `/en` chỉ đọc published revision.

Không cần iframe `postMessage` giữa Admin và Web cho canvas Puck. Preview dùng component renderer chung ngay trong Admin. Route preview riêng chỉ giữ lại nếu có nhu cầu chia sẻ hoặc mở toàn màn hình ngoài editor.

## Validation và fallback

- Nội dung bắt buộc không được trống khi publish.
- Giá trị số nằm trong range domain hiện tại.
- Style phải thuộc enum preset.
- Asset phải tồn tại và là public image.
- Dữ liệu revision cũ được deep-merge với mặc định mới.
- Nếu field mới chưa có trong revision cũ, renderer dùng default tương ứng.
- Save draft có thể giữ nội dung chưa hoàn chỉnh; publish mới chặn lỗi và chỉ rõ section/field.

## Phân quyền

- `WEBSITE_CONFIG_VIEW`: xem editor nhưng không chỉnh.
- `WEBSITE_CONFIG_UPDATE`: chỉnh và lưu nháp.
- `WEBSITE_CONFIG_PUBLISH`: xuất bản.

Puck permissions phải phản ánh quyền hiện tại, nhưng API vẫn là lớp kiểm soát cuối cùng.

## Kiểm thử

- Shared schema: fallback revision cũ, enum style và round-trip adapter.
- API: lưu draft, publish validation, bản public chỉ lấy published revision.
- Admin: registry khóa add/delete/reorder, inline edit cập nhật draft, quyền read-only.
- Web: renderer giữ đúng thứ tự cố định và áp dụng style token.
- Integration: sửa text trong Admin, lưu draft không đổi public, publish mới đổi `/vi` hoặc `/en`.
- Responsive: kiểm tra ba viewport Puck và homepage thật.

## Chuyển đổi phần đang làm dở

- Giữ migration, revision storage, API mapping và fallback homepage đã tạo nếu schema có thể nâng cấp tương thích.
- Thay form nhập hàng loạt `HomepageContentEditor` bằng Puck editor.
- Thay iframe preview dialog bằng canvas Puck; tránh duy trì hai cơ chế preview.
- Chuyển các component `AboutView` sang renderer/component registry dùng chung.
- Resolver tự bọc dữ liệu string của revision cũ thành `EditableText` với style mặc định khi đọc. Khi revision được lưu lại, API ghi schema mới; không cần cập nhật hàng loạt dữ liệu lịch sử trong database.

## Ngoài phạm vi

- Kéo thả hoặc đổi thứ tự section.
- Thêm/xóa/duplicate section.
- Rich text nhiều định dạng trong cùng một đoạn.
- HTML/CSS/JavaScript tùy ý.
- Tạo component mới từ giao diện quản trị.
- Lịch sử rollback riêng cho từng element.

## Tiêu chí hoàn thành

- Quản trị viên bấm trực tiếp từng text trên homepage để sửa.
- Style từng text được thay đổi bằng preset đã duyệt.
- Canvas và homepage công khai dùng chung renderer/component contract.
- Desktop/tablet/mobile preview hoạt động.
- Draft không ảnh hưởng public trước khi publish.
- Không thể thay đổi thứ tự hoặc cấu trúc tám section.
