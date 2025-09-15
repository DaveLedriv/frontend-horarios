import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));
const reactPath = resolve(rootDir, 'node_modules/react');
const reactDomPath = resolve(rootDir, 'node_modules/react-dom');
const reactJsxRuntimePath = resolve(rootDir, 'node_modules/react/jsx-runtime');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      react: reactPath,
      'react/jsx-runtime': reactJsxRuntimePath,
      'react-dom': reactDomPath,
      'react-router-dom/node_modules/react': reactPath,
      'react-router-dom/node_modules/react/jsx-runtime': reactJsxRuntimePath,
      'react-router-dom/node_modules/react-dom': reactDomPath,
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['react-router-dom'],
      },
    },
  },
});
