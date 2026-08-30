import { getPerformance, trace } from "@react-native-firebase/perf";

const perf = getPerformance();

/** Wraps an async call in a named Firebase Performance trace so its real-world duration shows up in the console. */
export const withTrace = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const activeTrace = trace(perf, name);
  await activeTrace.start();
  try {
    return await fn();
  } finally {
    await activeTrace.stop();
  }
};
