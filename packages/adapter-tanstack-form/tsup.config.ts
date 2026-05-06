import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [
    "@tanstack/react-form",
    "react",
    "@intentform/core",
    "@intentform/react",
    "@intentform/shared",
  ],
});
