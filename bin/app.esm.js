import { App } from "../build/index.esm.js";

// import minimist from "minimist";
// const argv = minimist(process.argv.slice(2));

// git config
const config = {};
const a = new App(config);

try {
  app.init();
} catch (e) {
  // App.log.error(e);
  if (process.argv.includes("--debug")) {
    Promise.reject(e);
  }
}
