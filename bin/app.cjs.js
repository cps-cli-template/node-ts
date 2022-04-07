const { App } = require("..");

// const minimist = require("minimist");
// const argv = minimist(process.argv.slice(2));

// git config

const config = {};
const app = new App(config);

try {
  app.init();
} catch (e) {
  // App.log.error(e);
  if (process.argv.includes("--debug")) {
    Promise.reject(e);
  }
}
