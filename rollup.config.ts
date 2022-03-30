import { defineConfig } from "rollup";

import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

export const config = defineConfig([
  // UMD (for browser script tag based imports)
  {
    input: "./src/index.ts",
    output: [
      {
        file: `build/${pkg.name}.min.js`,
        format: "umd",
        name: "Perspective",
        esModule: false,
        sourcemap: true,
      },
    ],

    plugins: [
      resolve(),
      typescript(),
      babel({
        babelHelpers: "bundled",
      }),
      terser(),
    ],
  },

  // ESM (for ES module imports) and CJS (for node.js)
  {
    input: "./src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        exports: "named",
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [resolve(), typescript()],
  },
]);

export default config;
