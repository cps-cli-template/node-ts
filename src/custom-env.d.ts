/* eslint-disable @typescript-eslint/naming-convention */
declare module "*.json" {
  const value: any;
  export default value;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly APP_VERSION: string;
  }
}
