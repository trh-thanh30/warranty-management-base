# 💎 Prisma & Database Schema

The database is powered by PostgreSQL and managed through Prisma, providing a robust, versioned, and type-safe data layer.

## 🌟 Schema Design Features

- **Strict Enums**: Usage of Postgres Enums for `user_role` and `user_status` to ensure data integrity at the database level.
- **Indexing Strategy**: Optimized query performance via multi-column indexes on frequently queried fields like `[role, status]`.
- **Relationship Mapping**: Clear `@map` aliases to maintain separation between TypeScript models and snake_case database tables.
- **Full-Text Search**: Preview feature enabled for advanced search capabilities on PostgreSQL.

---

## 🏗️ Core Model Example: User

```prisma
model User {
  id          String      @id @default(uuid()) @db.Uuid
  email       String      @unique
  role        user_role   @default(USER)
  status      user_status @default(ACTIVE)
  createdAt   DateTime    @default(now())

  @@index([role, status])
  @@map("user")
}
```

---

## 🛠️ Essential Database Commands

- **`make db-push-dev`**: Sync your local DB with the schema changes instantly.
- **`make db-seed-dev`**: Populate your database with fresh development data.
- **`npm run prisma:studio`**: Open the interactive GUI to explore and edit your data.
