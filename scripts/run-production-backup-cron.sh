#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_LABEL="${BACKUP_LABEL:-daily}"
CRON_HOUR="${BACKUP_CRON_HOUR:-3}"
CRON_MINUTE="${BACKUP_CRON_MINUTE:-0}"

read_env_value() {
  local key="$1"

  awk -v key="$key" '
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

validate_integer_range() {
  local value="$1"
  local minimum="$2"
  local maximum="$3"
  local name="$4"

  case "$value" in
    *[!0-9]*|"")
      printf 'ERROR: %s must be an integer between %s and %s\n' "$name" "$minimum" "$maximum" >&2
      exit 1
      ;;
  esac

  if [ "$((10#$value))" -lt "$minimum" ] || [ "$((10#$value))" -gt "$maximum" ]; then
    printf 'ERROR: %s must be an integer between %s and %s\n' "$name" "$minimum" "$maximum" >&2
    exit 1
  fi
}

if [ ! -f "$ENV_FILE" ]; then
  printf 'ERROR: env file not found: %s\n' "$ENV_FILE" >&2
  exit 1
fi

timezone="$(read_env_value TZ)"
case "$timezone" in
  *..*|/*|"")
    printf 'ERROR: invalid or missing TZ in %s\n' "$ENV_FILE" >&2
    exit 1
    ;;
esac
if [ ! -f "/usr/share/zoneinfo/$timezone" ]; then
  printf 'ERROR: timezone is not installed on this host: %s\n' "$timezone" >&2
  exit 1
fi

validate_integer_range "$CRON_HOUR" 0 23 BACKUP_CRON_HOUR
validate_integer_range "$CRON_MINUTE" 0 59 BACKUP_CRON_MINUTE
printf -v scheduled_time '%02d:%02d' "$((10#$CRON_HOUR))" "$((10#$CRON_MINUTE))"
current_time="$(TZ="$timezone" date +%H:%M)"

if [ "$current_time" != "$scheduled_time" ]; then
  exit 0
fi

# Scheduled backups deliberately use the deploy file as their source of truth.
# This prevents stale daemon/user environment variables from overriding Telegram
# or remote-backup settings that work during an interactive manual run.
unset BACKUP_DIR BACKUP_RETENTION_DAYS BACKUP_REMOTE_ENABLED BACKUP_REMOTE
unset BACKUP_TELEGRAM_ENABLED OPS_TELEGRAM_BOT_TOKEN OPS_TELEGRAM_CHAT_ID
unset APP_NAME NODE_ENV BACKUP_TIMEZONE
export ENV_FILE COMPOSE_FILE BACKUP_LABEL

exec "$(command -v bash)" ./scripts/backup-production.sh
