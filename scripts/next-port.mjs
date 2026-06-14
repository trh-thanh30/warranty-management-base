import { spawn } from "node:child_process";

const [mode, envName, fallbackPort, ...extraArgs] = process.argv.slice(2);

if (!mode || !envName || !fallbackPort) {
  console.error(
    "Usage: node scripts/next-port.mjs <dev|start> <ENV_NAME> <fallbackPort> [...args]",
  );
  process.exit(1);
}

const rawPort = process.env[envName] || fallbackPort;
const port = Number.parseInt(rawPort, 10);

if (
  !Number.isInteger(port) ||
  port < 1 ||
  port > 65535 ||
  String(port) !== rawPort
) {
  console.error(`${envName} must be a valid TCP port, received "${rawPort}".`);
  process.exit(1);
}

const child = spawn("next", [mode, "--port", String(port), ...extraArgs], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
