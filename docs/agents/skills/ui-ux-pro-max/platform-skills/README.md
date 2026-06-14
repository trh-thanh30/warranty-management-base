# UI UX Pro Max Platform Skills

Thư mục này chứa các bản skill self-contained cho từng assistant. Mỗi bản gồm:

- `SKILL.md`
- `data/`
- `scripts/`

Các bản này được tạo từ template upstream của UI UX Pro Max và chỉnh lại để phù hợp repo này: Next.js, React, TailwindCSS và shadcn-style UI.

## Danh Sách Platform

| Assistant | File chính | Ghi chú |
| :-------- | :--------- | :------ |
| GPT / ChatGPT-style agents | `gpt/skills/ui-ux-pro-max/SKILL.md` | Dùng cho GPT, ChatGPT Projects, custom GPT hoặc assistant không có định dạng skill riêng |
| Codex | `codex/skills/ui-ux-pro-max/SKILL.md` | Tương thích cấu trúc skill của Codex/uipro |
| Gemini CLI | `gemini/skills/ui-ux-pro-max/SKILL.md` | Tương thích cấu trúc skill của Gemini/uipro |
| Antigravity / Generic Agent | `antigravity/skills/ui-ux-pro-max/SKILL.md` | Tương thích cấu trúc `.agents` generic của uipro |

## Cách Dùng Trong Repo

Với agent đang chạy trong repo này, không cần copy đi đâu. Chỉ cần prompt:

```txt
Đọc docs/agents/skills/ui-ux-pro-max/platform-skills/codex/skills/ui-ux-pro-max/SKILL.md và dùng nó để thiết kế màn hình này.
```

Hoặc với GPT:

```txt
Đọc docs/agents/skills/ui-ux-pro-max/platform-skills/gpt/skills/ui-ux-pro-max/SKILL.md trước khi review UI.
```

## Cách Copy Sang Cấu Hình Assistant

Nếu muốn cài thủ công từ repo sang folder assistant:

### Codex

```bash
mkdir -p .codex/skills
cp -R docs/agents/skills/ui-ux-pro-max/platform-skills/codex/skills/ui-ux-pro-max .codex/skills/
```

### Gemini CLI

```bash
mkdir -p .gemini/skills
cp -R docs/agents/skills/ui-ux-pro-max/platform-skills/gemini/skills/ui-ux-pro-max .gemini/skills/
```

### Antigravity / Generic Agents

```bash
mkdir -p .agents/skills
cp -R docs/agents/skills/ui-ux-pro-max/platform-skills/antigravity/skills/ui-ux-pro-max .agents/skills/
```

### GPT / ChatGPT-style Assistants

GPT không có một chuẩn folder skill duy nhất. Cách dùng ổn định nhất:

1. Upload hoặc paste `gpt/skills/ui-ux-pro-max/SKILL.md` vào project instructions.
2. Nếu assistant có thể đọc file trong repo, trỏ nó đến file này.
3. Khi cần search data, yêu cầu chạy script trong repo:

```bash
python3 docs/agents/skills/ui-ux-pro-max/platform-skills/gpt/skills/ui-ux-pro-max/scripts/search.py "booking admin dashboard" --domain style -n 5
```

## Kiểm Tra Search Script

Mỗi platform skill có script riêng:

```bash
python3 docs/agents/skills/ui-ux-pro-max/platform-skills/codex/skills/ui-ux-pro-max/scripts/search.py "booking admin dashboard" --domain style -n 3
python3 docs/agents/skills/ui-ux-pro-max/platform-skills/gemini/skills/ui-ux-pro-max/scripts/search.py "booking admin dashboard" --domain style -n 3
python3 docs/agents/skills/ui-ux-pro-max/platform-skills/antigravity/skills/ui-ux-pro-max/scripts/search.py "booking admin dashboard" --domain style -n 3
python3 docs/agents/skills/ui-ux-pro-max/platform-skills/gpt/skills/ui-ux-pro-max/scripts/search.py "booking admin dashboard" --domain style -n 3
```

## Khi Nào Dùng Bản Platform Và Khi Nào Dùng `claude-skills`

Dùng `platform-skills` khi:

- Muốn cài/copy skill theo assistant cụ thể.
- Muốn bản self-contained có sẵn `data/` và `scripts/`.
- Muốn GPT/Codex/Gemini/Antigravity đọc đúng file riêng.

Dùng `claude-skills` khi:

- Làm việc với Claude Code.
- Muốn dùng các skill phụ như `brand`, `slides`, `banner-design`, `design-system`.
- Muốn tham khảo cấu trúc gốc từ upstream.

