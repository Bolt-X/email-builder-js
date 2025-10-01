import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    allowedHosts: ['mail-template.bolter.work', 'localhost'],
    port: 5173
  },
});
