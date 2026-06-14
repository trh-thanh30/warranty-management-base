# UI UX Pro Max Skill

Repo đã vendor bộ `nextlevelbuilder/ui-ux-pro-max-skill` vào:

```txt
docs/agents/skills/ui-ux-pro-max/
```

Bộ này cung cấp design intelligence cho UI/UX: style, màu sắc, typography, layout, accessibility, dashboard, landing page, chart, stack-specific UI guidance và checklist trước khi giao diện được xem là hoàn thiện.

Nguồn upstream:

```txt
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
```

## Cấu Trúc Đã Vendor

```txt
docs/agents/skills/ui-ux-pro-max/
├── claude-skills/        # Các skill Claude-style có thể đọc trực tiếp
├── platform-skills/      # Bản self-contained cho GPT, Codex, Gemini, Antigravity
├── src/                  # Data, script search, template và reasoning engine
├── skill.json            # Metadata upstream
├── UPSTREAM-README.md    # README gốc từ upstream
└── LICENSE               # License upstream
```

## Các Skill Chính

| Skill | Khi dùng | File |
| :---- | :------- | :--- |
| `ui-ux-pro-max` | Skill tổng hợp cho UI/UX, style, accessibility, responsive, typography, chart, dashboard | `claude-skills/ui-ux-pro-max/SKILL.md` |
| `ui-styling` | Khi cần styling chi tiết cho Tailwind, shadcn/ui, responsive, accessibility | `claude-skills/ui-styling/SKILL.md` |
| `design-system` | Khi cần token, primitive, semantic token, component spec, variant/state | `claude-skills/design-system/SKILL.md` |
| `brand` | Khi cần brand guideline, logo usage, color, typography, voice/messaging | `claude-skills/brand/SKILL.md` |
| `design` | Khi cần route các tác vụ thiết kế như logo, icon, banner, slide, social asset | `claude-skills/design/SKILL.md` |
| `slides` | Khi cần tạo slide, layout, copywriting formula, HTML slide template | `claude-skills/slides/SKILL.md` |
| `banner-design` | Khi cần banner, social graphic hoặc visual asset tĩnh | `claude-skills/banner-design/SKILL.md` |

## Bản Skill Theo Assistant

Ngoài `claude-skills`, repo có thêm các bản skill self-contained:

| Assistant | File |
| :-------- | :--- |
| GPT / ChatGPT-style agents | `platform-skills/gpt/skills/ui-ux-pro-max/SKILL.md` |
| Codex | `platform-skills/codex/skills/ui-ux-pro-max/SKILL.md` |
| Gemini CLI | `platform-skills/gemini/skills/ui-ux-pro-max/SKILL.md` |
| Antigravity / Generic Agent | `platform-skills/antigravity/skills/ui-ux-pro-max/SKILL.md` |

Xem chi tiết tại `platform-skills/README.md`.

## Khi Nào Phải Dùng

Dùng UI UX Pro Max khi task có tác động đến:

- Giao diện Web/Admin.
- Layout, spacing, typography, màu sắc.
- Responsive mobile/tablet/desktop.
- Accessibility, contrast, keyboard navigation, touch target.
- Dashboard, bảng dữ liệu, chart, filter, form.
- Landing page, product page, SaaS page.
- Design system, token, component variant.
- Brand visual, guideline, banner, slide.

Không cần dùng khi task chỉ liên quan backend, database, queue, infra, CI/CD hoặc script không có giao diện.

## Cách Dùng Nhanh Với Agent

Prompt mẫu:

```txt
Hãy dùng docs/agents/skills/ui-ux-pro-max/claude-skills/ui-ux-pro-max/SKILL.md để thiết kế UI cho màn hình này.
```

Với Codex/Gemini/Antigravity/GPT, có thể dùng bản platform:

```txt
Đọc docs/agents/skills/ui-ux-pro-max/platform-skills/codex/skills/ui-ux-pro-max/SKILL.md trước khi code UI.
```

```txt
Đọc docs/agents/skills/ui-ux-pro-max/platform-skills/gpt/skills/ui-ux-pro-max/SKILL.md để review giao diện này.
```

```txt
Hãy dùng UI UX Pro Max để review giao diện admin hiện tại theo accessibility, responsive, typography và visual hierarchy.
```

```txt
Trước khi code UI, hãy chạy search trong UI UX Pro Max cho domain style, color, typography và ux rồi đề xuất design system phù hợp.
```

## Search Data Bằng Script

Script search đã được vendor theo upstream và chạy được bằng Python:

```bash
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "booking admin dashboard" --domain style -n 5
```

Các domain thường dùng:

| Domain | Mục đích |
| :----- | :------- |
| `product` | Tìm recommendation theo loại sản phẩm |
| `style` | Tìm UI style phù hợp |
| `color` | Tìm bảng màu theo domain sản phẩm |
| `typography` | Tìm font pairing |
| `landing` | Tìm cấu trúc landing page và CTA |
| `chart` | Tìm chart type và thư viện phù hợp |
| `ux` | Tìm rule UX, accessibility, anti-pattern |

Ví dụ:

```bash
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "booking system" --domain product -n 5
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "admin dashboard" --domain ux -n 5
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "revenue chart" --domain chart -n 5
```

## Search Theo Stack

Repo hiện dùng Next.js, React và TailwindCSS. Các stack search hữu ích:

```bash
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "admin dashboard layout" --stack nextjs -n 5
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "form components" --stack react -n 5
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "data table" --stack shadcn -n 5
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "responsive layout" --stack html-tailwind -n 5
```

Các stack upstream hỗ trợ gồm `react`, `nextjs`, `astro`, `vue`, `nuxtjs`, `svelte`, `swiftui`, `react-native`, `flutter`, `html-tailwind`, `shadcn`, `jetpack-compose`, `angular`, `laravel`, `threejs`.

## Quy Trình Đề Xuất Cho Frontend Task

1. Đọc yêu cầu và xác định loại giao diện: dashboard, form, landing page, admin view, mobile view.
2. Search `product` để lấy reasoning theo loại sản phẩm.
3. Search `style` để chọn phong cách phù hợp.
4. Search `color` và `typography` để tạo palette/font system.
5. Search `ux` cho accessibility, interaction và responsive checklist.
6. Nếu có chart hoặc dashboard, search `chart`.
7. Nếu dùng Next.js/Tailwind/shadcn, search theo stack tương ứng.
8. Đề xuất design system ngắn gọn trước khi code.
9. Code UI theo design system đã chọn.
10. Kiểm tra lại responsive, accessibility, hover/focus/loading/empty/error states.

## Checklist Trước Khi Hoàn Thành UI

- [ ] Mỗi màn hình có hierarchy rõ: tiêu đề, nội dung chính, hành động chính.
- [ ] Text contrast đạt tối thiểu WCAG AA.
- [ ] Button/icon-only control có label hoặc aria-label.
- [ ] Touch target đủ lớn, tối thiểu khoảng 44x44px cho hành động chính.
- [ ] Layout không bị horizontal scroll trên mobile.
- [ ] Font size body không nhỏ hơn 16px trên mobile.
- [ ] Loading, empty, error và disabled state được xử lý.
- [ ] Hover, focus, active state rõ ràng.
- [ ] Animation dùng `transform`/`opacity`, có tôn trọng reduced motion nếu cần.
- [ ] Chart không chỉ dựa vào màu để truyền đạt ý nghĩa.
- [ ] UI không dùng emoji làm icon chính; ưu tiên Lucide hoặc icon system có sẵn.
- [ ] Không dùng palette một màu đơn điệu hoặc gradient tím/xanh tím quá lạm dụng.

## Dùng Với uipro-cli

Nếu muốn cài rule trực tiếp cho assistant trên máy cá nhân:

```bash
npm install -g uipro-cli
uipro init --ai codex
uipro init --ai claude
uipro init --ai cursor
uipro init --ai windsurf
uipro init --ai antigravity
uipro init --ai gemini
uipro init --ai all
```

Lưu ý: lệnh này có thể tạo file cấu hình riêng cho từng assistant. Sau khi chạy, kiểm tra diff để tránh mâu thuẫn với `AGENTS.md` và `docs/agents/README.md`.

## Cách Cập Nhật Từ Upstream

```bash
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git /tmp/ui-ux-pro-max-skill
rm -rf docs/agents/skills/ui-ux-pro-max
mkdir -p docs/agents/skills/ui-ux-pro-max
cp -R /tmp/ui-ux-pro-max-skill/.claude/skills docs/agents/skills/ui-ux-pro-max/claude-skills
cp -R /tmp/ui-ux-pro-max-skill/src docs/agents/skills/ui-ux-pro-max/src
cp /tmp/ui-ux-pro-max-skill/README.md docs/agents/skills/ui-ux-pro-max/UPSTREAM-README.md
cp /tmp/ui-ux-pro-max-skill/LICENSE docs/agents/skills/ui-ux-pro-max/LICENSE
cp /tmp/ui-ux-pro-max-skill/skill.json docs/agents/skills/ui-ux-pro-max/skill.json
```

Sau khi cập nhật, chạy thử:

```bash
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "admin dashboard" --domain style -n 3
```
