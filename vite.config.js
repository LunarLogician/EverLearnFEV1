import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['framer-motion', 'lucide-react'],
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      // Specific rule for the SSE streaming endpoint — must come before the generic /api rule.
      // Sets Accept-Encoding: identity so the Vite dev proxy doesn't compress/buffer the stream.
      '/api/chat/stream': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Accept-Encoding', 'identity');
          });
        },
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    }
  }
})
