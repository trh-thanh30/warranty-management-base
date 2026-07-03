# Overview

Docs app này là nơi viết tài liệu module cho frontend đọc trong lúc phát triển.

## Mục tiêu

- Mỗi module có tài liệu ngắn, rõ contract và flow chính.
- FE có thể mở qua port `8080` bằng lệnh `pnpm dev:docs`.
- Nội dung nằm trong file `.md`, không cần rebuild framework.
- Docs app không phụ thuộc `apps/api`, `apps/web` hoặc `apps/admin`.

## Cách chạy nhanh

Từ root repo, chạy:

```bash
pnpm dev:docs
```

Sau đó mở:

```txt
http://127.0.0.1:8080
```

Nếu muốn đổi port:

```bash
DOCS_PORT=8081 pnpm dev:docs
```

## Vị trí

```txt
apps/docs/
  public/
    index.html
    app.js
    content/
      modules.json
      overview.md
      api-contracts.md
      frontend-guide.md
  server.mjs
```

## Các script có sẵn

- `pnpm dev:docs`: chạy static docs server ở port `8080`.
- `pnpm start:docs`: chạy static docs server giống dev.
- `pnpm build:docs`: kiểm tra các file docs bắt buộc và khai báo trong `modules.json`.

## Cách thêm module docs

- Tạo file markdown mới trong `apps/docs/public/content`.
- Thêm item vào `apps/docs/public/content/modules.json`.
- Chạy `pnpm dev:docs` rồi mở `http://localhost:8080`.

Ví dụ thêm module `warranty`:

```json
{
  "id": "warranty",
  "title": "Warranty",
  "description": "Contract và flow nghiệp vụ bảo hành.",
  "file": "warranty.md"
}
```

## Troubleshooting

- Nếu port `8080` đã được dùng, chạy `DOCS_PORT=8081 pnpm dev:docs`.
- Nếu sidebar không thấy module mới, kiểm tra `modules.json` có đúng JSON và `file` trỏ đúng tên file `.md`.
- Nếu nội dung không đổi, reload browser vì server dùng cache `no-store` nhưng browser vẫn có thể giữ tab cũ.
