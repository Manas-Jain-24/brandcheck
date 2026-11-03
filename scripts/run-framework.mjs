import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { readExecutionProfile } from "./execution-profile.mjs";
await import("./prepare-document-worker.mjs");

const [command, ...args] = process.argv.slice(2);
if (!["dev", "build"].includes(command)) throw new Error("Expected dev or build.");
const managedLinux = readExecutionProfile() === "managed-linux";

if (command === "dev") {
  const lockUrl = new URL("../.vinext/dev/lock.json", import.meta.url);
  try {
    if (fs.existsSync(lockUrl)) {
      const lockData = JSON.parse(fs.readFileSync(lockUrl, "utf-8"));
      if (lockData?.pid && typeof lockData.pid === "number" && lockData.pid !== process.pid) {
        try { process.kill(lockData.pid, "SIGKILL"); } catch {}
      }
      fs.rmSync(lockUrl, { force: true });
    }
  } catch {}
}

if (managedLinux && command === "build") {
  const result = spawnSync("bash", [
    fileURLToPath(new URL("./build-verified.sh", import.meta.url)), ...args,
  ], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

// Import in this process so the preview owner retains its PID and signals.
const cli = new URL(managedLinux
  ? "../node_modules/vite/bin/vite.js"
  : "../node_modules/vinext/dist/cli.js", import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), command,
  ...(!managedLinux && command === "dev" ? ["--port", "5173", "--hostname", "0.0.0.0"] : []), ...args];
await import(cli.href);
