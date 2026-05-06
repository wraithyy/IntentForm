import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  jsx: "react-jsx",
  external: ["react", "react-dom", "@intentform/core", "@intentform/shared"],
});
