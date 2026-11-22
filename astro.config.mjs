// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://stellalabs.tech',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  },
  output: 'static',
  adapter: cloudflare({
    imageService: 'cloudflare',
    }
  )
});