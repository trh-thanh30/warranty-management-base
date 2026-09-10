# Activation request Excel export: installation date

## Goal

Add the optional installation timestamp to the warranty activation request Excel export.

## Scope

- Add a `Ngày thi công` column after `Năm sản xuất`.
- Export `installed_at` as a native Excel date-time value with the format `dd/mm/yyyy hh:mm`.
- Leave the cell blank when a request has no installation timestamp.
- Add mapper and workbook regression coverage.

## Data flow

`warranty_activation_request.installed_at` -> export record -> Excel row `installedAt` -> `Ngày thi công` column -> workbook date-time format.

## Non-goals

- Do not add an Excel import flow.
- Do not change API endpoints, database schema, query filters, or the admin export UI.
- Do not change the activation-request form behavior.

## Error handling

`installed_at` is nullable. The exporter preserves `null`, so Excel renders an empty cell rather than an invalid value.

## Verification

- Mapper test asserts that a populated installation timestamp is present in the exported row.
- Workbook test asserts the `installedAt` column uses `dd/mm/yyyy hh:mm`.
- Run targeted API tests, API typecheck, lint, and build.
