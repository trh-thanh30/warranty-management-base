# Hướng Dẫn Sử Dụng Agent Skills

Thư mục này chứa workflow và skill dành cho AI coding agents. Mục tiêu là biến quy trình làm việc thành tài liệu nằm trong repo, để Codex, Claude Code, Cursor, Windsurf, Antigravity, Gemini CLI, Copilot và các assistant khác có thể đọc cùng một nguồn hướng dẫn.

Nguồn cảm hứng chính là bộ skills của Matt Pocock trong bài viết "5 Agent Skills I Use Every Day":

- `/grill-me`
- `/to-prd`
- `/to-issues`
- `/tdd`
- `/improve-codebase-architecture`

Bộ skill đầy đủ đã được vendored vào repo tại:

```txt
docs/agents/skills/mattpocock/
```

Bộ UI/UX Pro Max đã được vendored vào repo tại:

```txt
docs/agents/skills/ui-ux-pro-max/
```

Các workflow đã được repo chỉnh lại theo cấu trúc nội bộ nằm tại:

```txt
docs/agents/workflows/
```

## Cách Hiểu Skill Trong Repo Này

Skill là một tài liệu quy trình cho agent. Một skill thường định nghĩa:

- Khi nào nên dùng skill.
- Agent cần đọc bối cảnh nào trước.
- Agent phải hỏi người dùng những gì.
- Agent nên tạo output ở đâu.
- Tiêu chuẩn hoàn thành công việc.

Không phải assistant nào cũng tự động đọc được `SKILL.md`. Vì vậy repo này lưu skill theo hai lớp:

- **Workflow repo-native**: các file trong `docs/agents/workflows/`, dùng trực tiếp cho dự án này.
- **Skill gốc đã vendored**: các file trong `docs/agents/skills/mattpocock/`, giữ nguyên bộ kỹ năng tham khảo để dùng cho nhiều assistant.
- **Skill UI/UX vendored**: các file trong `docs/agents/skills/ui-ux-pro-max/`, dùng cho frontend, design system, styling, accessibility và UX review.

## Luồng Mặc Định

Với task lớn hoặc chưa rõ, dùng luồng sau:

1. `docs/agents/workflows/01-grill-with-docs.md`
2. `docs/agents/workflows/02-to-prd.md`
3. `docs/agents/workflows/03-to-issues.md`
4. `docs/agents/workflows/04-tdd.md`
5. `docs/agents/workflows/05-diagnose.md`
6. `docs/agents/workflows/06-improve-codebase-architecture.md`
7. `docs/agents/workflows/07-triage.md`
8. `docs/agents/workflows/08-handoff.md`

Không phải task nào cũng cần đi đủ tám bước. Với thay đổi nhỏ, agent có thể đi thẳng vào triển khai sau khi đọc đủ context.

## Năm Skill Cốt Lõi

| Skill | Khi dùng | File trong repo |
| :---- | :------- | :-------------- |
| `grill-me` | Khi ý tưởng còn mơ hồ, cần agent hỏi sâu từng nhánh quyết định trước khi viết plan | `docs/agents/skills/mattpocock/grill-me/SKILL.md` |
| `to-prd` | Khi đã hiểu yêu cầu và cần chuyển thành PRD rõ ràng | `docs/agents/skills/mattpocock/to-prd/SKILL.md` |
| `to-issues` | Khi cần tách PRD hoặc plan thành các ticket vertical slice | `docs/agents/skills/mattpocock/to-issues/SKILL.md` |
| `tdd` | Khi triển khai logic rủi ro, bug fix, feature quan trọng theo vòng red-green-refactor | `docs/agents/skills/mattpocock/tdd/SKILL.md` |
| `improve-codebase-architecture` | Khi cần review kiến trúc, tìm module nông, boundary mờ hoặc dependency rối | `docs/agents/skills/mattpocock/improve-codebase-architecture/SKILL.md` |

## Skill UI/UX Cốt Lõi

| Skill | Khi dùng | File trong repo |
| :---- | :------- | :-------------- |
| `ui-ux-pro-max` | Khi task ảnh hưởng đến UI, UX, layout, responsive, accessibility, design system hoặc visual quality | `docs/agents/skills/ui-ux-pro-max/claude-skills/ui-ux-pro-max/SKILL.md` |
| `ui-styling` | Khi cần styling chi tiết với Tailwind, shadcn/ui, responsive và accessibility | `docs/agents/skills/ui-ux-pro-max/claude-skills/ui-styling/SKILL.md` |
| `design-system` | Khi cần token, component spec, state, variant, semantic color | `docs/agents/skills/ui-ux-pro-max/claude-skills/design-system/SKILL.md` |
| `brand` | Khi cần brand guideline, màu sắc, typography, logo usage, voice/messaging | `docs/agents/skills/ui-ux-pro-max/claude-skills/brand/SKILL.md` |

Các bản riêng cho GPT, Codex, Gemini và Antigravity nằm tại:

```txt
docs/agents/skills/ui-ux-pro-max/platform-skills/
```

## Cách Gọi Skill Khi Chat Với Agent

Bạn có thể gọi skill bằng ngôn ngữ tự nhiên:

```txt
Hãy dùng grill-me để hỏi sâu yêu cầu này trước khi code.
```

```txt
Hãy chuyển context hiện tại thành PRD theo docs/agents/workflows/02-to-prd.md.
```

```txt
Hãy dùng TDD cho module này, đi từng red-green-refactor cycle.
```

```txt
Hãy review kiến trúc theo improve-codebase-architecture.
```

Nếu assistant không hỗ trợ slash command, hãy chỉ rõ đường dẫn file:

```txt
Đọc docs/agents/skills/mattpocock/tdd/SKILL.md rồi triển khai theo hướng dẫn trong đó.
```

Với UI/UX:

```txt
Đọc docs/agents/skills/ui-ux-pro-max/README.md và docs/agents/skills/ui-ux-pro-max/claude-skills/ui-ux-pro-max/SKILL.md trước khi thiết kế màn hình này.
```

```txt
Với Codex, đọc docs/agents/skills/ui-ux-pro-max/platform-skills/codex/skills/ui-ux-pro-max/SKILL.md.
```

```txt
Với GPT, đọc docs/agents/skills/ui-ux-pro-max/platform-skills/gpt/skills/ui-ux-pro-max/SKILL.md.
```

```txt
Chạy search UI UX Pro Max cho "booking admin dashboard" ở domain style, color, typography và ux rồi đề xuất design system trước khi code.
```

## Dùng Với Codex

Codex đọc `AGENTS.md` ở root repo. Vì vậy quy tắc chính nên nằm trong:

```txt
AGENTS.md
docs/agents/README.md
docs/agents/workflows/
```

Cách dùng khuyến nghị:

```txt
Theo AGENTS.md, hãy dùng workflow 01-grill-with-docs cho yêu cầu này.
```

```txt
Hãy đọc docs/agents/skills/mattpocock/tdd/SKILL.md và triển khai thay đổi theo TDD.
```

Lưu ý: lệnh `npx skills add mattpocock/skills -g` cài skill vào global `~/.agents/skills`. Codex session hiện tại có thể không tự nạp thư mục đó. Bản vendored trong `docs/agents/skills/mattpocock/` giúp repo không phụ thuộc vào global install.

## Dùng Với Claude Code

Claude Code thường đọc file hướng dẫn repo như `CLAUDE.md` hoặc context được người dùng nhắc trong prompt. Nếu dự án dùng Claude Code, có thể tạo `CLAUDE.md` trỏ về:

```txt
AGENTS.md
docs/agents/README.md
docs/agents/workflows/
docs/agents/skills/mattpocock/
```

Prompt mẫu:

```txt
Read AGENTS.md and docs/agents/README.md. Use the tdd skill for this change.
```

Hoặc:

```txt
Use docs/agents/skills/mattpocock/grill-me/SKILL.md before writing an implementation plan.
```

## Dùng Với Cursor

Với Cursor, bạn có thể thêm rule trỏ về tài liệu agent:

```txt
Always read AGENTS.md for repo workflow.
For large tasks, follow docs/agents/README.md and docs/agents/workflows/.
When a skill is named, read docs/agents/skills/mattpocock/<skill>/SKILL.md first.
```

Prompt mẫu:

```txt
Use the repo agent workflow. Start with grill-me, then write a PRD if needed.
```

## Dùng Với Windsurf

Với Windsurf/Cascade, thêm rule tương tự:

```txt
Before high-impact changes, follow AGENTS.md and docs/agents/workflows/01-grill-with-docs.md.
Use docs/agents/skills/mattpocock/ as the local skill library.
```

Prompt mẫu:

```txt
Follow the local tdd skill in docs/agents/skills/mattpocock/tdd/SKILL.md.
```

## Dùng Với Antigravity, Gemini CLI, Copilot Và Assistant Khác

Các assistant không có skill runtime vẫn dùng được bằng cách đọc file trực tiếp:

```txt
Hãy đọc AGENTS.md và docs/agents/README.md trước.
Sau đó dùng docs/agents/workflows/03-to-issues.md để tách PRD thành issue.
```

Hoặc:

```txt
Use docs/agents/skills/mattpocock/improve-codebase-architecture/SKILL.md to review this repo.
Return findings with file references and concrete recommendations.
```

Nguyên tắc chung:

- Luôn trỏ assistant đến `AGENTS.md` trước.
- Với skill cụ thể, trỏ đến đúng `SKILL.md`.
- Với task lớn, yêu cầu agent tạo PRD hoặc issue trong `docs/prd/` và `docs/issues/`.
- Với task frontend, yêu cầu agent đọc `docs/agents/skills/ui-ux-pro-max/README.md`.
- Với handoff, yêu cầu agent dùng `docs/agents/workflows/08-handoff.md`.

## Dùng Với UI Pro CLI

`uipro-cli` là công cụ riêng để cài rule/hướng dẫn UI cho nhiều assistant. Repo này không yêu cầu cài UI Pro để dùng agent skills, nhưng có thể dùng bổ sung nếu dự án có nhiều tác vụ frontend.

Cài CLI global:

```bash
npm install -g uipro-cli
```

Chạy trong root repo:

```bash
uipro init --ai codex
uipro init --ai claude
uipro init --ai cursor
uipro init --ai windsurf
uipro init --ai antigravity
uipro init --ai gemini
uipro init --ai copilot
uipro init --ai all
```

Sau khi chạy, kiểm tra file mà UI Pro tạo ra để tránh ghi đè hoặc mâu thuẫn với `AGENTS.md`.

Trong repo này, bản UI UX Pro Max đã được vendor sẵn, nên assistant có thể đọc trực tiếp:

```txt
docs/agents/skills/ui-ux-pro-max/README.md
docs/agents/skills/ui-ux-pro-max/claude-skills/ui-ux-pro-max/SKILL.md
```

## Cài Lại Matt Pocock Skills Trên Máy Cá Nhân

Cài toàn bộ skills vào global:

```bash
npx skills@latest add mattpocock/skills
```

Cài một skill cụ thể:

```bash
npx skills@latest add mattpocock/skills --skill=grill-me -y -g
```

Kiểm tra thư mục global:

```bash
ls ~/.agents/skills
```

Lưu ý: global install chỉ ảnh hưởng máy cá nhân. Repo vẫn nên giữ bản vendored trong `docs/agents/skills/mattpocock/` để mọi assistant và mọi thành viên team dùng chung được.

## Khi Nào Dùng Workflow Repo Và Khi Nào Dùng Skill Gốc

Dùng `docs/agents/workflows/` khi:

- Làm việc trực tiếp trong repo này.
- Muốn output đi vào `docs/prd/`, `docs/issues/`, `docs/adr/`.
- Muốn agent tuân theo convention riêng của dự án.

Dùng `docs/agents/skills/mattpocock/` khi:

- Muốn tham khảo skill gốc.
- Muốn dùng một skill chưa được chuyển thành workflow repo-native.
- Muốn dùng cùng skill cho Claude, Cursor, Windsurf, Antigravity, Gemini hoặc assistant khác.

## Checklist Trước Khi Giao Task Cho Agent

- [ ] Nói rõ task nhỏ hay task lớn.
- [ ] Với task lớn, yêu cầu agent bắt đầu từ `grill-me` hoặc `grill-with-docs`.
- [ ] Với tính năng mới, yêu cầu tạo PRD trước khi code.
- [ ] Với PRD đã có, yêu cầu tách thành issue vertical slice.
- [ ] Với logic rủi ro, yêu cầu dùng TDD.
- [ ] Với task UI/UX, yêu cầu dùng UI UX Pro Max và search style/color/typography/ux trước khi code.
- [ ] Với refactor lớn, yêu cầu review kiến trúc trước.
- [ ] Với context dài hoặc chuẩn bị dừng, yêu cầu tạo handoff.
