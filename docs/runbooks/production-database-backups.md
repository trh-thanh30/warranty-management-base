# Production database backups

## Backup layers

The production backup script creates a PostgreSQL custom-format dump, verifies that `pg_restore` can read it, writes a portable SHA-256 checksum, and optionally uploads both artifacts through an rclone remote.

Database dumps contain customer data. Use an rclone `crypt` remote for off-server storage so file contents are encrypted before they reach Google Drive. This project keeps backup filenames visible for operations, while the dump contents remain encrypted.

## Configure Google Drive on the VPS

Install rclone and inspect existing remotes:

```bash
rclone version
rclone listremotes
```

If the VPS does not already have the Google Drive remote used by the other project, create one with `rclone config`. Name the base remote `gdrive`. Google authorization requires an interactive browser login; do not commit its token or configuration file to this repository.

Confirm the base remote works:

```bash
rclone lsd gdrive:
```

Run `rclone config` again and create a remote named `warranty-gdrive-visible` with:

- storage type: `crypt`;
- remote: `gdrive:warranty-management-base-backups-visible`;
- filename encryption: `off`;
- advanced config `suffix`: `none`;
- a unique password and salt stored in the operations password manager.

Use a new underlying Drive folder rather than changing the filename-encryption setting of an existing crypt remote. Previously uploaded files use a different filename mapping and should remain accessible through their original remote configuration.

Protect the local rclone configuration:

```bash
chmod 600 "$(rclone config file | tail -n 1)"
```

## Enable remote upload

Add these values to the VPS `.env.production`:

```dotenv
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=7
BACKUP_REMOTE_ENABLED=true
BACKUP_REMOTE=warranty-gdrive-visible:database
BACKUP_TELEGRAM_ENABLED=true
OPS_TELEGRAM_BOT_TOKEN=replace-with-telegram-bot-token
OPS_TELEGRAM_CHAT_ID=replace-with-chat-id
```

Create and upload a manual backup from the deployment directory:

```bash
ENV_FILE=.env.production \
  COMPOSE_FILE=docker-compose.prod.yml \
  BACKUP_LABEL=manual \
  bash ./scripts/backup-production.sh
```

List the decrypted backup names through the crypt remote:

```bash
rclone lsl warranty-gdrive-visible:database
```

The Drive UI shows filenames such as `daily_20260824_030001.dump`; file contents remain encrypted by the crypt remote.

## Schedule the daily backup

The installer reads `TZ` from `.env.production` and installs an idempotent crontab block for 03:00 in that timezone:

```bash
chmod 700 scripts/backup-production.sh scripts/install-production-backup-cron.sh
ENV_FILE=.env.production \
  COMPOSE_FILE=docker-compose.prod.yml \
  bash ./scripts/install-production-backup-cron.sh
```

Verify the installed schedule:

```bash
crontab -l
```

Cron output is appended to `./backups/cron.log`. Successful and failed runs notify the Telegram chat configured with `OPS_TELEGRAM_BOT_TOKEN` and `OPS_TELEGRAM_CHAT_ID`.

## Recovery check

Download one dump and its checksum into an isolated directory, then verify both the checksum and PostgreSQL archive before attempting any restore:

```bash
mkdir -p /tmp/warranty-backup-restore-check
rclone copy warranty-gdrive-visible:database \
  /tmp/warranty-backup-restore-check \
  --include 'manual_*.dump' \
  --include 'manual_*.dump.sha256'

cd /tmp/warranty-backup-restore-check
sha256sum --check manual_YYYYMMDD_HHMMSS.dump.sha256
pg_restore --list manual_YYYYMMDD_HHMMSS.dump >/dev/null
```

A listed remote file is not sufficient proof of recoverability. Schedule a restore drill against an isolated PostgreSQL database after remote upload is operational.
