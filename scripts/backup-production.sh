#!/usr/bin/env bash
set -euo pipefail
umask 077

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-}"
BACKUP_LABEL="${BACKUP_LABEL:-}"
BACKUP_REMOTE_ENABLED="${BACKUP_REMOTE_ENABLED:-}"
BACKUP_REMOTE="${BACKUP_REMOTE:-}"
BACKUP_TELEGRAM_ENABLED="${BACKUP_TELEGRAM_ENABLED:-}"
OPS_TELEGRAM_BOT_TOKEN="${OPS_TELEGRAM_BOT_TOKEN:-}"
OPS_TELEGRAM_CHAT_ID="${OPS_TELEGRAM_CHAT_ID:-}"
APP_NAME="${APP_NAME:-}"
NODE_ENV="${NODE_ENV:-}"
BACKUP_TIMEZONE="${BACKUP_TIMEZONE:-}"

TIMESTAMP=""
DB_BACKUP_DIR=""
BACKUP_FILE=""
CHECKSUM_FILE=""

log() {
  printf '%s\n' "[$(date +%Y-%m-%dT%H:%M:%S%z)] $*"
}

read_env_value() {
  local key="$1"

  awk -v key="$key" '
    BEGIN { FS = "=" }
    /^[[:space:]]*#/ || /^[[:space:]]*$/ { next }
    {
      line = $0
      sub(/^[[:space:]]*export[[:space:]]+/, "", line)
      separator = index(line, "=")
      if (separator == 0) next

      name = substr(line, 1, separator - 1)
      value = substr(line, separator + 1)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", name)
      if (name != key) next

      gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
      if ((substr(value, 1, 1) == "\"" && substr(value, length(value), 1) == "\"") ||
          (substr(value, 1, 1) == "\047" && substr(value, length(value), 1) == "\047")) {
        value = substr(value, 2, length(value) - 2)
      }
      print value
      exit
    }
  ' "$ENV_FILE"
}

load_config() {
  if [ ! -f "$ENV_FILE" ]; then
    log "ERROR: env file not found: $ENV_FILE"
    exit 1
  fi

  BACKUP_DIR="${BACKUP_DIR:-$(read_env_value BACKUP_DIR)}"
  BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-$(read_env_value BACKUP_RETENTION_DAYS)}"
  BACKUP_LABEL="${BACKUP_LABEL:-daily}"
  BACKUP_REMOTE_ENABLED="${BACKUP_REMOTE_ENABLED:-$(read_env_value BACKUP_REMOTE_ENABLED)}"
  BACKUP_REMOTE="${BACKUP_REMOTE:-$(read_env_value BACKUP_REMOTE)}"
  BACKUP_TELEGRAM_ENABLED="${BACKUP_TELEGRAM_ENABLED:-$(read_env_value BACKUP_TELEGRAM_ENABLED)}"
  OPS_TELEGRAM_BOT_TOKEN="${OPS_TELEGRAM_BOT_TOKEN:-$(read_env_value OPS_TELEGRAM_BOT_TOKEN)}"
  OPS_TELEGRAM_CHAT_ID="${OPS_TELEGRAM_CHAT_ID:-$(read_env_value OPS_TELEGRAM_CHAT_ID)}"
  APP_NAME="${APP_NAME:-$(read_env_value APP_NAME)}"
  NODE_ENV="${NODE_ENV:-$(read_env_value NODE_ENV)}"
  BACKUP_TIMEZONE="${BACKUP_TIMEZONE:-$(read_env_value TZ)}"

  BACKUP_DIR="${BACKUP_DIR:-./backups}"
  BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
  BACKUP_REMOTE_ENABLED="${BACKUP_REMOTE_ENABLED:-false}"
  BACKUP_TELEGRAM_ENABLED="${BACKUP_TELEGRAM_ENABLED:-true}"
  APP_NAME="${APP_NAME:-Warranty Management}"
  NODE_ENV="${NODE_ENV:-production}"
  BACKUP_TIMEZONE="${BACKUP_TIMEZONE:-UTC}"

  case "$BACKUP_DIR" in
    /|.|..|"")
      log "ERROR: unsafe BACKUP_DIR: $BACKUP_DIR"
      exit 1
      ;;
  esac

  case "$BACKUP_RETENTION_DAYS" in
    *[!0-9]*|"")
      log "ERROR: BACKUP_RETENTION_DAYS must be a non-negative integer"
      exit 1
      ;;
  esac

  case "$BACKUP_LABEL" in
    *[!A-Za-z0-9._-]*|"")
      log "ERROR: BACKUP_LABEL may only contain letters, numbers, dots, underscores and hyphens"
      exit 1
      ;;
  esac

  case "$BACKUP_REMOTE_ENABLED" in
    true|false) ;;
    *)
      log "ERROR: BACKUP_REMOTE_ENABLED must be either true or false"
      exit 1
      ;;
  esac

  case "$BACKUP_TELEGRAM_ENABLED" in
    true|false) ;;
    *)
      log "ERROR: BACKUP_TELEGRAM_ENABLED must be either true or false"
      exit 1
      ;;
  esac

  case "$BACKUP_TIMEZONE" in
    *..*|/*|"")
      log "ERROR: invalid TZ: $BACKUP_TIMEZONE"
      exit 1
      ;;
  esac
  if [ ! -f "/usr/share/zoneinfo/$BACKUP_TIMEZONE" ]; then
    log "ERROR: timezone is not installed on this host: $BACKUP_TIMEZONE"
    exit 1
  fi

  if [ "$BACKUP_REMOTE_ENABLED" = "true" ]; then
    case "$BACKUP_REMOTE" in
      *:*) ;;
      *)
        log "ERROR: BACKUP_REMOTE must be an rclone remote path such as warranty-gdrive-visible:database"
        exit 1
        ;;
    esac
  fi

  TZ="$BACKUP_TIMEZONE"
  export TZ
  TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
  DB_BACKUP_DIR="$BACKUP_DIR/db"
  BACKUP_FILE="$DB_BACKUP_DIR/${BACKUP_LABEL}_${TIMESTAMP}.dump"
  CHECKSUM_FILE="${BACKUP_FILE}.sha256"
}

html_escape() {
  printf '%s' "$1" \
    | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g'
}

send_telegram() {
  local status="$1"
  local detail="$2"

  if [ "$BACKUP_TELEGRAM_ENABLED" != "true" ]; then
    log "Telegram notification disabled: $status"
    return 0
  fi

  if [ -z "$OPS_TELEGRAM_BOT_TOKEN" ] || [ -z "$OPS_TELEGRAM_CHAT_ID" ]; then
    log "WARNING: Telegram notification skipped because OPS_TELEGRAM_BOT_TOKEN or OPS_TELEGRAM_CHAT_ID is missing"
    return 0
  fi

  local text
  text="<b>Production Database Backup: $(html_escape "$status")</b>

<b>App:</b> <code>$(html_escape "$APP_NAME")</code>
<b>Environment:</b> <code>$(html_escape "$NODE_ENV")</code>
<b>Timezone:</b> <code>$(html_escape "$BACKUP_TIMEZONE")</code>
<b>Time:</b> <code>$(date +%Y-%m-%dT%H:%M:%S%z)</code>
<b>File:</b> <code>$(html_escape "${BACKUP_FILE:-not-created}")</code>
<b>Remote:</b> <code>$(html_escape "${BACKUP_REMOTE:-disabled}")</code>

$(html_escape "$detail")"

  if command -v curl >/dev/null 2>&1; then
    if curl -fsS -X POST \
      "https://api.telegram.org/bot${OPS_TELEGRAM_BOT_TOKEN}/sendMessage" \
      --connect-timeout 10 \
      --max-time 30 \
      -d "chat_id=${OPS_TELEGRAM_CHAT_ID}" \
      -d "parse_mode=HTML" \
      -d "disable_web_page_preview=true" \
      --data-urlencode "text=${text}" >/dev/null; then
      log "Telegram notification sent: $status"
    else
      log "WARNING: Telegram notification failed: $status"
    fi
    return 0
  fi

  log "WARNING: Telegram notification skipped because curl is not installed"
}

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

require_database() {
  if ! compose config --services | grep -qx db; then
    log "ERROR: Compose file does not define the db service"
    return 1
  fi

  if [ "$(compose ps --status running --services db)" != "db" ]; then
    log "ERROR: production database container is not running"
    return 1
  fi
}

backup_database() {
  mkdir -p "$DB_BACKUP_DIR"

  log "Starting PostgreSQL backup: $BACKUP_FILE"
  if ! compose exec -T db sh -lc \
    'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' \
    >"$BACKUP_FILE"; then
    rm -f "$BACKUP_FILE"
    log "ERROR: pg_dump failed"
    return 1
  fi

  if [ ! -s "$BACKUP_FILE" ]; then
    rm -f "$BACKUP_FILE"
    log "ERROR: backup file is empty"
    return 1
  fi

  log "Verifying PostgreSQL archive"
  if ! compose exec -T db pg_restore --list <"$BACKUP_FILE" >/dev/null; then
    rm -f "$BACKUP_FILE"
    log "ERROR: pg_restore could not read the backup archive"
    return 1
  fi

  backup_filename="$(basename "$BACKUP_FILE")"
  checksum_filename="$(basename "$CHECKSUM_FILE")"
  (
    cd "$DB_BACKUP_DIR"
    sha256sum "$backup_filename" >"$checksum_filename"
  )
  if ! (
    cd "$DB_BACKUP_DIR"
    sha256sum --check "$checksum_filename" >/dev/null
  ); then
    rm -f "$BACKUP_FILE" "$CHECKSUM_FILE"
    log "ERROR: backup checksum verification failed"
    return 1
  fi

  log "Backup completed and verified: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
}

upload_backup() {
  if [ "$BACKUP_REMOTE_ENABLED" != "true" ]; then
    log "Remote backup upload is disabled"
    return 0
  fi

  if ! command -v rclone >/dev/null 2>&1; then
    log "ERROR: rclone is required when remote backup upload is enabled"
    return 1
  fi

  remote_root="${BACKUP_REMOTE%/}"
  backup_filename="$(basename "$BACKUP_FILE")"
  checksum_filename="$(basename "$CHECKSUM_FILE")"

  log "Uploading encrypted backup artifacts to $remote_root"
  if ! rclone copyto "$BACKUP_FILE" "$remote_root/$backup_filename" \
    --checksum \
    --check-first \
    --retries 3; then
    log "ERROR: database backup upload failed"
    return 1
  fi

  if ! rclone copyto "$CHECKSUM_FILE" "$remote_root/$checksum_filename" \
    --checksum \
    --check-first \
    --retries 3; then
    log "ERROR: checksum upload failed"
    return 1
  fi

  if ! rclone lsf "$remote_root" --files-only | grep -Fxq "$backup_filename"; then
    log "ERROR: uploaded database backup was not found on the remote"
    return 1
  fi

  if ! rclone lsf "$remote_root" --files-only | grep -Fxq "$checksum_filename"; then
    log "ERROR: uploaded checksum was not found on the remote"
    return 1
  fi

  log "Remote backup upload completed: $remote_root/$backup_filename"
}

cleanup_old_backups() {
  log "Removing local database backups older than ${BACKUP_RETENTION_DAYS} day(s)"
  find "$DB_BACKUP_DIR" -type f \
    \( -name '*.dump' -o -name '*.dump.sha256' \) \
    -mtime "+$BACKUP_RETENTION_DAYS" -print -delete
}

main() {
  load_config

  if require_database && \
    backup_database && \
    upload_backup && \
    cleanup_old_backups; then
    send_telegram "SUCCESS" "Database dump was verified and uploaded successfully."
    printf '%s\n' "$BACKUP_FILE"
    return 0
  fi

  send_telegram "FAILED" "Backup failed. Check the VPS backup log for details."
  return 1
}

main "$@"
