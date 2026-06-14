# Improve Codebase Architecture

Use after a surge of development or before major feature work.

Look for:

- Concepts spread across many tiny files.
- Modules with unclear public interfaces.
- Helpers extracted only for testability while bugs live in orchestration.
- Cross-module coupling that makes changes risky.
- Shared package imports that point back into apps.

Propose deepening opportunities and record accepted decisions in `docs/adr/`.
