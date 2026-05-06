import catppuccin from "@catppuccin/starlight";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

export default defineConfig({
  site: "https://wraithyy.github.io",
  base: "/IntentForm",
  integrations: [
    react(),
    starlight({
      title: "IntentForm",
      description:
        "Natural language → validated forms via pluggable AI providers",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/wraithyy/IntentForm",
        },
      ],
      sidebar: [
        {
          label: "Start",
          items: [
            { label: "Overview", link: "/" },
            { label: "Quick Start", link: "/quick-start/" },
          ],
        },
        {
          label: "Concepts",
          autogenerate: { directory: "concepts" },
        },
        {
          label: "Recipes",
          autogenerate: { directory: "recipes" },
        },
        { label: "Playground", link: "/playground/" },
        typeDocSidebarGroup,
      ],
      plugins: [
        catppuccin({ dark: { flavor: "mocha", accent: "mauve" }, light: { flavor: "latte", accent: "mauve" } }),
        starlightTypeDoc({
          entryPoints: [
            "../../packages/core/src/index.ts",
            "../../packages/react/src/index.ts",
            "../../packages/shared/src/index.ts",
          ],
          tsconfig: "./tsconfig.typedoc.json",
          output: "api",
          sidebar: {
            label: "API Reference",
            collapsed: true,
          },
          typeDocOptions: {
            skipErrorChecking: true,
            entryPointStrategy: "resolve",
          },
        }),
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
