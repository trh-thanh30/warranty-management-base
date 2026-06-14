# Agent Skill Library

Repo này vendor bộ Matt Pocock skills vào:

```txt
docs/agents/skills/mattpocock/
```

Repo cũng vendor bộ UI UX Pro Max vào:

```txt
docs/agents/skills/ui-ux-pro-max/
```

Mục đích là để mọi assistant có thể đọc skill từ repo, kể cả khi máy local chưa cài `npx skills`, `uipro-cli` hoặc assistant không tự nạp global skills.

## Skill Cốt Lõi Cho Quy Trình Phát Triển

| Skill | File |
| :---- | :--- |
| `grill-me` | `mattpocock/grill-me/SKILL.md` |
| `grill-with-docs` | `mattpocock/grill-with-docs/SKILL.md` |
| `to-prd` | `mattpocock/to-prd/SKILL.md` |
| `to-issues` | `mattpocock/to-issues/SKILL.md` |
| `tdd` | `mattpocock/tdd/SKILL.md` |
| `diagnose` | `mattpocock/diagnose/SKILL.md` |
| `triage` | `mattpocock/triage/SKILL.md` |
| `handoff` | `mattpocock/handoff/SKILL.md` |
| `improve-codebase-architecture` | `mattpocock/improve-codebase-architecture/SKILL.md` |

## Skill Bổ Trợ

| Skill | File |
| :---- | :--- |
| `prototype` | `mattpocock/prototype/SKILL.md` |
| `review` | `mattpocock/review/SKILL.md` |
| `qa` | `mattpocock/qa/SKILL.md` |
| `request-refactor-plan` | `mattpocock/request-refactor-plan/SKILL.md` |
| `design-an-interface` | `mattpocock/design-an-interface/SKILL.md` |
| `setup-pre-commit` | `mattpocock/setup-pre-commit/SKILL.md` |
| `zoom-out` | `mattpocock/zoom-out/SKILL.md` |
| `ubiquitous-language` | `mattpocock/ubiquitous-language/SKILL.md` |
| `teach` | `mattpocock/teach/SKILL.md` |
| `write-a-skill` | `mattpocock/write-a-skill/SKILL.md` |
| `setup-matt-pocock-skills` | `mattpocock/setup-matt-pocock-skills/SKILL.md` |

## Skill UI/UX Pro Max

| Skill | File |
| :---- | :--- |
| `ui-ux-pro-max` | `ui-ux-pro-max/claude-skills/ui-ux-pro-max/SKILL.md` |
| `ui-styling` | `ui-ux-pro-max/claude-skills/ui-styling/SKILL.md` |
| `design-system` | `ui-ux-pro-max/claude-skills/design-system/SKILL.md` |
| `brand` | `ui-ux-pro-max/claude-skills/brand/SKILL.md` |
| `design` | `ui-ux-pro-max/claude-skills/design/SKILL.md` |
| `slides` | `ui-ux-pro-max/claude-skills/slides/SKILL.md` |
| `banner-design` | `ui-ux-pro-max/claude-skills/banner-design/SKILL.md` |

Xem hướng dẫn riêng tại `ui-ux-pro-max/README.md`.

## UI/UX Platform Skills

| Assistant | File |
| :-------- | :--- |
| GPT / ChatGPT-style agents | `ui-ux-pro-max/platform-skills/gpt/skills/ui-ux-pro-max/SKILL.md` |
| Codex | `ui-ux-pro-max/platform-skills/codex/skills/ui-ux-pro-max/SKILL.md` |
| Gemini CLI | `ui-ux-pro-max/platform-skills/gemini/skills/ui-ux-pro-max/SKILL.md` |
| Antigravity / Generic Agent | `ui-ux-pro-max/platform-skills/antigravity/skills/ui-ux-pro-max/SKILL.md` |

Xem hướng dẫn copy/cài thủ công tại `ui-ux-pro-max/platform-skills/README.md`.

## Skill Khác Trong Bộ Vendored

- `caveman`
- `edit-article`
- `git-guardrails-claude-code`
- `migrate-to-shoehorn`
- `obsidian-vault`
- `scaffold-exercises`
- `writing-beats`
- `writing-fragments`
- `writing-shape`

## Cách Cập Nhật Bộ Vendored

Nếu đã cài global:

```bash
npx skills@latest add mattpocock/skills
```

Sau đó copy lại vào repo:

```bash
rm -rf docs/agents/skills/mattpocock
cp -R ~/.agents/skills docs/agents/skills/mattpocock
```

Trước khi commit, kiểm tra diff để chắc chắn không có file không mong muốn.

## Cập Nhật UI UX Pro Max

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

Kiểm tra script search:

```bash
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "admin dashboard" --domain style -n 3
```
