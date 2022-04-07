const { App } = require("..");

try {
  const app = new App();
} catch (e) {
  // App.log.error(e);
  if (process.argv.includes("--debug")) {
    Promise.reject(e);
  }
}
