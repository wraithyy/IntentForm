import catppuccin from "@catppuccin/starlight";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";
import mermaid from "astro-mermaid";

export default defineConfig({
  site: "https://wraithyy.github.io",
  base: "/IntentForm",
  integrations: [
    mermaid({ theme: "dark", autoTheme: true }),
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
      components: {
        Hero: "./src/components/Hero.astro",
      },
      head: [
        { tag: "link", attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" } },
        { tag: "link", attrs: { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: true } },
        { tag: "link", attrs: { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Outfit:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" } },
      ],
    }),
  ],
});
