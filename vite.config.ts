import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isDev = mode === 'development';
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    // Ensure correct asset URLs when deploying to https://<user>.github.io/ups/
    base: '/ups/',
    plugins: [react()],
    define: {
      // Do not embed real API keys into production bundle
      'process.env.API_KEY': JSON.stringify(isDev ? env.GEMINI_API_KEY : ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
