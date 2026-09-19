import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: '0.0.0.0', port: 5000, allowedHosts: true, strictPort: true },
  test: { environment: 'jsdom', globals: true, include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
});
