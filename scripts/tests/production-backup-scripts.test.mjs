import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "../..");

function executable(path, contents) {
  writeFileSync(path, contents);
  chmodSync(path, 0o700);
}

test("backup cron is timezone-aware without relying on CRON_TZ support", () => {
  const fixture = mkdtempSync(join(tmpdir(), "backup-cron-install-"));
  const deployDir = join(fixture, "deploy");
  const fakeBin = join(fixture, "bin");
  const crontabState = join(fixture, "crontab");
  mkdirSync(join(deployDir, "scripts"), { recursive: true });
  mkdirSync(fakeBin);
  writeFileSync(join(deployDir, ".env.production"), "TZ=Asia/Ho_Chi_Minh\n");
  writeFileSync(
    join(deployDir, "scripts/backup-production.sh"),
    "#!/usr/bin/env bash\n",
  );
  writeFileSync(
    join(deployDir, "scripts/run-production-backup-cron.sh"),
    "#!/usr/bin/env bash\n",
  );
  executable(
    join(fakeBin, "crontab"),
    `#!/usr/bin/env bash
set -euo pipefail
if [ "\${1:-}" = "-l" ]; then
  [ ! -f "$CRONTAB_STATE" ] || cat "$CRONTAB_STATE"
  exit 0
fi
cp "$1" "$CRONTAB_STATE"
`,
  );

  execFileSync(
    "bash",
    [join(repoRoot, "scripts/install-production-backup-cron.sh")],
    {
      cwd: deployDir,
      env: {
        ...process.env,
        CRONTAB_STATE: crontabState,
        DEPLOY_DIR: deployDir,
        ENV_FILE: ".env.production",
        COMPOSE_FILE: "docker-compose.prod.yml",
        PATH: `${fakeBin}:${process.env.PATH}`,
      },
    },
  );

  const installed = readFileSync(crontabState, "utf8");
  assert.match(installed, /^\* \* \* \* \* cd /m);
  assert.match(installed, /run-production-backup-cron\.sh/);
  assert.doesNotMatch(installed, /^CRON_TZ=/m);
});

test("cron runner invokes backup only at the configured local time", () => {
  const fixture = mkdtempSync(join(tmpdir(), "backup-cron-runner-"));
  const fakeBin = join(fixture, "bin");
  const marker = join(fixture, "ran");
  mkdirSync(join(fixture, "scripts"));
  mkdirSync(fakeBin);
  writeFileSync(join(fixture, ".env.production"), "TZ=Asia/Ho_Chi_Minh\n");
  cpSync(
    join(repoRoot, "scripts/run-production-backup-cron.sh"),
    join(fixture, "scripts/run-production-backup-cron.sh"),
  );
  executable(
    join(fixture, "scripts/backup-production.sh"),
    '#!/usr/bin/env bash\nprintf "%s|%s" "$BACKUP_LABEL" "${BACKUP_TELEGRAM_ENABLED-unset}" > "$RUN_MARKER"\n',
  );
  executable(
    join(fakeBin, "date"),
    '#!/usr/bin/env bash\nprintf "%s\\n" "$FAKE_LOCAL_TIME"\n',
  );

  const baseEnv = {
    ...process.env,
    BACKUP_CRON_HOUR: "3",
    BACKUP_CRON_MINUTE: "0",
    BACKUP_TELEGRAM_ENABLED: "false",
    FAKE_LOCAL_TIME: "02:59",
    PATH: `${fakeBin}:${process.env.PATH}`,
    RUN_MARKER: marker,
  };
  execFileSync("bash", ["./scripts/run-production-backup-cron.sh"], {
    cwd: fixture,
    env: baseEnv,
  });
  assert.throws(() => readFileSync(marker));

  execFileSync("bash", ["./scripts/run-production-backup-cron.sh"], {
    cwd: fixture,
    env: { ...baseEnv, FAKE_LOCAL_TIME: "03:00" },
  });
  assert.equal(readFileSync(marker, "utf8"), "daily|unset");
});

test("backup logs successful Telegram delivery", () => {
  const fixture = mkdtempSync(join(tmpdir(), "backup-telegram-"));
  const fakeBin = join(fixture, "bin");
  mkdirSync(fakeBin);
  writeFileSync(
    join(fixture, ".env.production"),
    [
      "TZ=Asia/Ho_Chi_Minh",
      `BACKUP_DIR=${join(fixture, "backups")}`,
      "BACKUP_RETENTION_DAYS=7",
      "BACKUP_REMOTE_ENABLED=false",
      "BACKUP_TELEGRAM_ENABLED=true",
      "OPS_TELEGRAM_BOT_TOKEN=test-token",
      "OPS_TELEGRAM_CHAT_ID=test-chat",
      "",
    ].join("\n"),
  );
  executable(
    join(fakeBin, "docker"),
    `#!/usr/bin/env bash
case "$*" in
  *"config --services"*) printf "db\\n" ;;
  *"ps --status running --services db"*) printf "db\\n" ;;
  *"pg_dump"*) printf "fake-postgres-archive" ;;
  *"pg_restore --list"*) cat >/dev/null ;;
  *) exit 1 ;;
esac
`,
  );
  executable(join(fakeBin, "curl"), "#!/usr/bin/env bash\nexit 0\n");

  const output = execFileSync(
    "bash",
    [join(repoRoot, "scripts/backup-production.sh")],
    {
      cwd: fixture,
      encoding: "utf8",
      env: { ...process.env, PATH: `${fakeBin}:${process.env.PATH}` },
    },
  );
  assert.match(output, /Telegram notification sent: SUCCESS/);
});
