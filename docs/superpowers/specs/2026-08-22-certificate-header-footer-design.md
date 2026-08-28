# Thiết kế header và footer chứng nhận bảo hành

## Mục tiêu

- Tăng khả năng nhận diện thương hiệu và độ rõ khi đọc PDF ở kích thước A4 thực tế.
- Biến footer thành khu vực hỗ trợ tra cứu bảo hành thay vì lặp lại tiêu đề chứng nhận.
- Giữ nguyên dữ liệu, nghiệp vụ cấp chứng nhận và cơ chế phân trang hiện tại.

## Phạm vi thay đổi

- Template HTML/CSS của chứng nhận bảo hành điện tử.
- Kích thước logo và chữ trong header/footer.
- Nội dung footer và các kiểm thử snapshot/string liên quan.

Không thay đổi API, database, mã bảo hành, mã chứng nhận, email hoặc quy tắc cấp bảo hành.

## Header

- Giữ bố cục logo bên trái, thông tin chứng nhận bên phải.
- Cắt hoặc xử lý khoảng trắng nội tại của asset logo để kích thước CSS phản ánh đúng kích thước nhìn thấy.
- Tăng logo nhìn thấy khoảng 15–20%, không làm thay đổi tỷ lệ ảnh.
- Tăng nhãn hệ thống từ 7px lên 8px.
- Tăng mã chứng nhận từ 9px lên 10px.
- Chỉ tăng chiều cao header vừa đủ để không làm giảm đáng kể vùng nội dung A4.

## Footer

Footer gồm ba khu vực trên desktop/A4:

1. Logo FUJITEK và LEXZENZ bên trái.
2. Nội dung tra cứu ở giữa:

   **TRA CỨU BẢO HÀNH ĐIỆN TỬ**

   Kiểm tra hiệu lực và thời hạn bảo hành tại

   **baohanh.lexzenz.com/tra-cuu**

3. Thông tin tài liệu bên phải:

   Ngày cấp: **{{certificate.issuedAt}}**

   Mã chứng nhận: **{{certificate.number}}**

Loại bỏ câu “Chứng nhận được phát hành tự động bởi hệ thống E-Warranty” và tiêu đề “Chứng nhận bảo hành điện tử” đang lặp với phần thân tài liệu.

## Kích thước đề xuất

- Logo header: rộng 48–50mm, cao tối đa khoảng 10mm.
- Logo footer: rộng 42–44mm, cao tối đa khoảng 9mm.
- Tiêu đề footer: 9px, đậm.
- Nội dung phụ footer: 8px.
- Ngày cấp và mã chứng nhận: 8–9px, mã dùng trọng lượng đậm.

Kích thước cuối cùng được tinh chỉnh theo preview A4, ưu tiên không gây thêm trang PDF chỉ vì header/footer.

## Phân trang

- Header và footer tiếp tục lặp trên từng trang bằng cấu trúc `thead`/`tfoot` hiện có.
- Mã chứng nhận được giữ trong footer để mỗi trang vẫn tự nhận diện được khi bị tách hoặc in riêng.
- Không dùng định vị tuyệt đối khiến footer chồng lên bảng dữ liệu.

## Kiểm tra

- Test render HTML có nội dung footer mới và không còn nội dung cũ.
- Test dữ liệu ngày cấp và mã chứng nhận vẫn được render.
- Chạy preview với trường hợp một sản phẩm và dữ liệu nhiều trang.
- Chạy test module chứng nhận, typecheck API và kiểm tra format/diff.
