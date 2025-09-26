import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOST;

export default defineConfig({
  plugins: [react()],
  base: '/email-builder-js/',
  server: {
    allowedHosts: [ALLOWED_HOST],
  },
});
