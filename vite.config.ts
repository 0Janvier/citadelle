import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Use relative paths for Tauri production builds
  base: './',

  // Polyfill Buffer pour pdfmake qui en a besoin pour les fonts
  define: {
    'global': 'globalThis',
  },

  // Prevent vite from obscuring rust errors
  clearScreen: false,

  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,

    // Manual chunk splitting for optimization
    // Note: react/react-dom grouped with tiptap/react to avoid circular dependency
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'zustand',
            '@tiptap/react',
            '@tiptap/core',
            '@tiptap/starter-kit'
          ],
          'tiptap-extensions': [
            '@tiptap/extension-placeholder',
            '@tiptap/extension-typography',
            '@tiptap/extension-link',
            '@tiptap/extension-image',
            '@tiptap/extension-table',
            '@tiptap/extension-task-list',
            '@tiptap/extension-task-item'
          ],
          'pdfmake': ['pdfmake'],
          'docx': ['docx'],
        }
      }
    }
  },

  // Optimize pdfmake dependencies
  optimizeDeps: {
    include: ['pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts']
  },
})
