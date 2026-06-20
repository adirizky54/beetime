import { defineConfig } from "electron-vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
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
      react(),
    ],
  },
});
