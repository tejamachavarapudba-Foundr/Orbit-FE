const { spawn } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");

const expoCli = path.join(__dirname, "..", "node_modules", "expo", "bin", "cli");
const userArgs = process.argv.slice(2);
const args = ["start", "--port", "8082", "--clear", ...userArgs];
const isLanMode = userArgs.includes("--host") && userArgs.includes("lan");

const getLanIp = () => {
  const interfaces = os.networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }

  return "localhost";
};

const lanIp = getLanIp();
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? (isLanMode ? `http://${lanIp}:3000/api` : undefined);

const child = spawn(process.execPath, [expoCli, ...args], {
  cwd: path.join(__dirname, ".."),
  env: {
    ...process.env,
    ...(apiBaseUrl ? { EXPO_PUBLIC_API_BASE_URL: apiBaseUrl } : {}),
    EXPO_NO_DOCTOR: "1",
    EXPO_OFFLINE: "1"
  },
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
