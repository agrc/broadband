import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // Work around a Vite dev-time module mismatch in the Utah design system dependency
      // chain. Remove this once the upstream packages stop deep-importing
      // use-sync-external-store/shim/index.js and dev startup succeeds without the alias.
      'use-sync-external-store/shim/index.js': 'use-sync-external-store/shim',
    },
  },
  plugins: [react()],
});
