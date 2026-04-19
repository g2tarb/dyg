import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/auth': 'http://localhost:3001',
      '/sitemap.xml': 'http://localhost:3001',
      '/robots.txt': 'http://localhost:3001'
    }
  },
  build: {
    outDir: 'dist'
  }
});
