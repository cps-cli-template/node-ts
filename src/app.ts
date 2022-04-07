import { IApp } from "./types";

/**
 * type for App
 * @public
 */
export class App implements IApp {
  public async init() {
    console.log("app init");
  }
}

const app = new App();
console.log("app: init ");
