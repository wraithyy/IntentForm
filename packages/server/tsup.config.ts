import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [
    "@tanstack/react-start",
    "hono",
    "next",
    "@intentform/core",
    "@intentform/shared",
  ],
});
