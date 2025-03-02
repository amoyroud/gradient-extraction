import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Add worker configuration to properly handle web workers
  worker: {
    format: 'es', // Use ESM format for better compatibility
    plugins: () => [react()] // Use the same React plugin for workers
  },
  // Add define for process.env.NODE_ENV to ensure production builds work correctly
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  },
  build: {
    // Optimize chunks for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Group React and related packages into one chunk
          react: ['react', 'react-dom'],
          // Group UI components and animations
          ui: ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-select'],
          // Group utility libraries
          utils: ['uuid', 'color-thief-ts']
        }
      }
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log in production
        drop_console: true,
      },
    },
  },
  // Enable fast refresh even for complex cases
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dropzone'],
  }
})) 