import { defineConfig } from "rollup";

import fs from "fs";
import json5 from "json5";

import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

const defaultTsconfig = {};
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

      typescript({ tsconfigOverride: defaultTsconfig }),

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
    plugins: [
      resolve(),
      typescript({ tsconfigOverride: defaultTsconfig }),
    ],
  },
]);

export default config;