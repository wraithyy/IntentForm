import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [
    "@intentform/provider-openai",
    "@intentform/provider-anthropic",
    "@intentform/provider-google",
    "@intentform/provider-ollama",
    "@intentform/core",
    "@intentform/server",
    "@intentform/shared",
  ],
});
