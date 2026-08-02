#!/usr/bin/env bash

set -euo pipefail

trim_endpoint_url() {
  local value="$1"

  value="${value//$'\r'/}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"

  printf '%s' "$value"
}

check_endpoint() {
  local endpoint_name="$1"
  local raw_url="$2"
  local endpoint_url
  local curl_command="${CURL_BIN:-curl}"

  endpoint_url="$(trim_endpoint_url "$raw_url")"

  if [[ -z "$endpoint_url" ]]; then
    return 1
  fi

  case "$endpoint_url" in
    http://?* | https://?*) ;;
    *)
      echo "::error::$endpoint_name must be an absolute HTTP(S) URL without quotes or a KEY= prefix." >&2
      return 2
      ;;
  esac

  if [[ "$endpoint_url" == *[[:space:]]* || "$endpoint_url" == *\"* || "$endpoint_url" == *\'* ]]; then
    echo "::error::$endpoint_name must be an absolute HTTP(S) URL without embedded whitespace or quotes." >&2
    return 2
  fi

  echo "Checking $endpoint_name..."
  "$curl_command" \
    --fail \
    --show-error \
    --silent \
    --location \
    "$endpoint_url" > /dev/null
  echo "$endpoint_name passed."
}

checked=0

for endpoint_name in \
  DEPLOY_API_HEALTH_URL \
  DEPLOY_WEB_URL \
  DEPLOY_ADMIN_URL; do
  raw_url="${!endpoint_name-}"

  if check_endpoint "$endpoint_name" "$raw_url"; then
    checked=$((checked + 1))
  else
    result=$?
    if [[ "$result" -eq 2 ]]; then
      exit "$result"
    fi
  fi
done

if [[ "$checked" -eq 0 ]]; then
  echo "No deployment endpoint secrets configured. Skipping health check."
fi
