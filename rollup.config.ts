import { defineConfig } from "rollup";

import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import builtins from "builtins";
import json from "@rollup/plugin-json";

const outputName = "index";

export const config = defineConfig([
  // ESM (for ES module imports) and CJS (for node.js)
  {
    input: "src/index.ts",
    external: [...builtins(), ...Object.keys(pkg.devDependencies)],
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
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            target: "ES2017",
            module: "ES2015",
          },
        },
      }),
      resolve(),
      json(),
      commonjs(),
    ],
  },
]);

export default config;
