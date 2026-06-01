type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = typeof __DEV__ !== "undefined" && __DEV__;

const write = (level: LogLevel, message: string, meta?: unknown) => {
  if (!isDev && level !== "error") {
    return;
  }

  const payload = meta === undefined ? "" : meta;
  console[level](`[Startuphouze] ${message}`, payload);
};

export const logger = {
  debug: (message: string, meta?: unknown) => write("debug", message, meta),
  info: (message: string, meta?: unknown) => write("info", message, meta),
  warn: (message: string, meta?: unknown) => write("warn", message, meta),
  error: (message: string, meta?: unknown) => write("error", message, meta)
};
