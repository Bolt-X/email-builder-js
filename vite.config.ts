import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    allowedHosts: ['mail-template.bolter.work', 'localhost'],
    port: 5173
  },
});
