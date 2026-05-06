import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import catppuccin from "@catppuccin/starlight";
import { defineConfig } from "astro/config";
import mermaid from "astro-mermaid";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

export default defineConfig({
  site: "https://wraithyy.github.io",
  base: "/IntentForm",
  integrations: [
    mermaid({ theme: "dark", autoTheme: true }),
    react(),
    starlight({
      title: "IntentForm",
      logo: {
        src: "./src/assets/logo.png",
        replacesTitle: false,
      },
      favicon: "/favicon.png",
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
          items: [
            {
              label: "Server integration",
              items: [
                {
                  label: "Keep API key server-side",
                  link: "/recipes/server-side-key/",
                },
                {
                  label: "TanStack Start",
                  link: "/recipes/server-tanstack-start/",
                },
                { label: "Next.js", link: "/recipes/server-next/" },
                { label: "Hono", link: "/recipes/server-hono/" },
                {
                  label: "HTTP sidecar",
                  link: "/recipes/server-http-sidecar/",
                },
                { label: "Spring Boot", link: "/recipes/server-spring/" },
              ],
            },
            {
              label: "Form adapters",
              items: [
                {
                  label: "TanStack Form",
                  link: "/recipes/adapter-tanstack-form/",
                },
                {
                  label: "React Hook Form",
                  link: "/recipes/adapter-react-hook-form/",
                },
              ],
            },
            {
              label: "UI libraries",
              items: [
                { label: "Native HTML", link: "/recipes/ui-native-html/" },
                { label: "shadcn/ui", link: "/recipes/ui-shadcn/" },
                { label: "MUI", link: "/recipes/ui-mui/" },
                { label: "Mantine", link: "/recipes/ui-mantine/" },
              ],
            },
            {
              label: "Examples",
              items: [
                { label: "Accident report", link: "/recipes/accident-report/" },
                { label: "Travel booking", link: "/recipes/travel-booking/" },
              ],
            },
          ],
        },
        { label: "Playground", link: "/playground/" },
        typeDocSidebarGroup,
      ],
      plugins: [
        catppuccin({
          dark: { flavor: "mocha", accent: "mauve" },
          light: { flavor: "latte", accent: "mauve" },
        }),
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
        Hero: "./src/components/hero.astro",
      },
      head: [
        {
          tag: "link",
          attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" },
        },
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossorigin: true,
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Outfit:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap",
          },
        },
      ],
    }),
  ],
});
