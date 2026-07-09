// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: "https://byron1001.github.io",
  base: "/firm-demo/",
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()]
  },

  i18n: {
    locales: ["en", "ms"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [react(), sitemap()]
});