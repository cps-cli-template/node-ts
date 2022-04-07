import { App } from "../build/index.mjs";

try {
  const app = new App(config);
} catch (e) {
  // App.log.error(e);
  if (process.argv.includes("--debug")) {
    Promise.reject(e);
  }
}
