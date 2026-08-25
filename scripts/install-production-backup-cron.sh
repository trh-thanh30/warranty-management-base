#!/usr/bin/env bash
set -euo pipefail
umask 077

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
DEPLOY_DIR="${DEPLOY_DIR:-$(pwd -P)}"
CRON_HOUR="${BACKUP_CRON_HOUR:-3}"
CRON_MINUTE="${BACKUP_CRON_MINUTE:-0}"
MARKER_START="# warranty-management-production-backup:start"
MARKER_END="# warranty-management-production-backup:end"

log() {
  printf '%s\n' "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

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
      log "ERROR: $name must be an integer between $minimum and $maximum"
      exit 1
      ;;
  esac

  if [ "$value" -lt "$minimum" ] || [ "$value" -gt "$maximum" ]; then
    log "ERROR: $name must be an integer between $minimum and $maximum"
    exit 1
  fi
}

main() {
  if ! command -v crontab >/dev/null 2>&1; then
    log "ERROR: crontab is not installed"
    exit 1
  fi

  local bash_bin
  bash_bin="$(command -v bash)"

  if [ ! -f "$ENV_FILE" ]; then
    log "ERROR: env file not found: $ENV_FILE"
    exit 1
  fi

  if [ ! -f "$DEPLOY_DIR/scripts/backup-production.sh" ]; then
    log "ERROR: backup script not found in $DEPLOY_DIR/scripts"
    exit 1
  fi

  if [ ! -f "$DEPLOY_DIR/scripts/run-production-backup-cron.sh" ]; then
    log "ERROR: backup cron runner not found in $DEPLOY_DIR/scripts"
    exit 1
  fi

  local timezone
  timezone="$(read_env_value TZ)"
  case "$timezone" in
    *..*|/*|"")
      log "ERROR: invalid or missing TZ in $ENV_FILE"
      exit 1
      ;;
  esac
  if [ ! -f "/usr/share/zoneinfo/$timezone" ]; then
    log "ERROR: timezone is not installed on this host: $timezone"
    exit 1
  fi

  validate_integer_range "$CRON_HOUR" 0 23 BACKUP_CRON_HOUR
  validate_integer_range "$CRON_MINUTE" 0 59 BACKUP_CRON_MINUTE
  mkdir -p "$DEPLOY_DIR/backups"
  chmod 700 "$DEPLOY_DIR/backups"

  local current_crontab
  local next_crontab
  current_crontab="$(mktemp)"
  next_crontab="$(mktemp)"
  trap "rm -f '$current_crontab' '$next_crontab'" EXIT

  crontab -l >"$current_crontab" 2>/dev/null || true
  awk -v start="$MARKER_START" -v end="$MARKER_END" '
    $0 == start { skipping = 1; next }
    $0 == end { skipping = 0; next }
    !skipping { print }
  ' "$current_crontab" >"$next_crontab"

  {
    printf '\n%s\n' "$MARKER_START"
    printf '* * * * * cd %q && ENV_FILE=%q COMPOSE_FILE=%q BACKUP_LABEL=daily BACKUP_CRON_HOUR=%q BACKUP_CRON_MINUTE=%q %q ./scripts/run-production-backup-cron.sh >> ./backups/cron.log 2>&1\n' \
      "$DEPLOY_DIR" \
      "$ENV_FILE" \
      "$COMPOSE_FILE" \
      "$CRON_HOUR" \
      "$CRON_MINUTE" \
      "$bash_bin"
    printf '%s\n' "$MARKER_END"
  } >>"$next_crontab"

  crontab "$next_crontab"
  log "Installed timezone-aware daily production backup at $(printf '%02d:%02d' "$CRON_HOUR" "$CRON_MINUTE") in $timezone"
  crontab -l | awk -v start="$MARKER_START" -v end="$MARKER_END" '
    $0 == start { printing = 1 }
    printing { print }
    $0 == end { printing = 0 }
  '
}

main "$@"
