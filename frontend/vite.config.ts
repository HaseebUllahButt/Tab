import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 58362,
    strictPort: true,
  },
  preview: {
    port: 58362,
    strictPort: true,
  },
});
