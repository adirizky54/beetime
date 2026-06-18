import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "react",
      quoteStyle: "double",
      semicolons: true,
      routeTreeFileHeader: [
        "/* eslint-disable */",
        "// @ts-nocheck",
        "// noinspection JSUnusedGlobalSymbols",
        "/* oxlint-disable */",
        "/* oxfmt-ignore */",
      ],
    }),
    viteReact(),
  ],
});

export default config;
