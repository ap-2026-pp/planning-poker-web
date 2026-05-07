import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:5249';

  return {
    plugins: [react()],
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
        '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      },
    },
    build: {
      target: 'es2020',
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/hubs': {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
