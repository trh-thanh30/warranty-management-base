#!/bin/sh

set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${AUDIT_SQL_FILE:?AUDIT_SQL_FILE is required}"

# Prisma accepts a `schema` query parameter that libpq/psql does not recognize.
# Remove only that parameter while preserving other connection options.
psql_database_url="$(
  printf '%s' "$DATABASE_URL" |
    sed -E 's/([?&])schema=[^&]*(&|$)/\1/; s/\?&/?/; s/[?&]$//'
)"

exec psql "$psql_database_url" -v ON_ERROR_STOP=1 -f "$AUDIT_SQL_FILE"
