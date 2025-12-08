import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    // Optimizaciones para mejorar el rendimiento
    watch: {
      // Excluir archivos que no necesitan ser observados
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/logs.txt',
        '**/gemini.txt',
      ],
    },
    // Mejorar el tiempo de respuesta del HMR
    hmr: {
      overlay: true,
    },
  },
  // Pre-optimizar dependencias comunes para mejorar el tiempo de inicio
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@auth0/auth0-react',
      'axios',
    ],
    // Excluir dependencias problemáticas del pre-bundling
    exclude: ['@vitejs/plugin-react'],
    // Forzar re-optimización si hay problemas
    force: false,
  },
  // Optimizaciones de build
  build: {
    // Reducir el tamaño del bundle
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'auth-vendor': ['@auth0/auth0-react'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
        },
      },
    },
    // Aumentar el límite de tamaño de advertencia
    chunkSizeWarningLimit: 1000,
  },
});
