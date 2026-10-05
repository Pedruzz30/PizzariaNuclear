import { spawn } from "node:child_process";
import { resolve } from "node:path";

const [command, ...args] = process.argv.slice(2);
if (!["dev", "build", "start"].includes(command)) {
  console.error("Uso: node scripts/run-next.mjs <dev|build|start> [...opções]");
  process.exit(2);
}

const child = spawn(
  process.execPath,
  [resolve("node_modules/next/dist/bin/next"), command, ...args],
  {
    stdio: "inherit",
    env: { ...process.env, NODE_USE_SYSTEM_CA: "1" },
  },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("error", (error) => {
  console.error("Falha ao iniciar Next.js:", error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
