# Module Conventions

## API

Each API module should expose a clear Nest module boundary:

- `*.module.ts`
- `*.controller.ts`
- `*.service.ts`
- `dto.ts` or `dto/` for request contracts

Domain modules should live under `apps/api/src/modules/<domain>`.

Backend modules should follow the clean-architecture layering documented in `docs/architecture/backend-folder-structure.md`:

- controller layer for HTTP delivery
- DTO layer for request validation
- use case layer for business flow
- repository layer for data access
- tests folder for use case unit tests

Every new domain module should include `use-cases/`, `repository/`, and `tests/` once it owns business behavior or data access.

## Frontend

Create features as vertical slices near the app that owns the route. Move code into `packages/ui` or `packages/shared` only when it is reused by at least two apps or is clearly framework-neutral.

## Shared Packages

`packages/shared` should contain types, schemas, constants, and utilities that do not depend on Next.js or NestJS.
