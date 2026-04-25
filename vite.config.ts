import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (
            id.includes('@ant-design/pro-') ||
            id.includes('@ant-design/pro-layout') ||
            id.includes('@ant-design/pro-utils')
          ) {
            return 'ant-design-pro';
          }

          if (id.includes('@ant-design/charts')) {
            return 'charts-wrapper';
          }

          if (id.includes('@antv/g2plot') || id.includes('@antv/g2')) {
            return 'charts-core';
          }

          if (id.includes('@antv/')) {
            return 'charts-vendor';
          }

          if (id.includes('/xlsx/')) {
            return 'xlsx';
          }
        },
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    tsConfigPaths(),
    viteReact(),
    tailwindcss(),
  ],
});
