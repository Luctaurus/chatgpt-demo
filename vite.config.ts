import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 降低分包数量
  build: {
    // 降低分包数量
    chunkSizeWarningLimit: 1000,
    // 限制 rollup 的工作线程数量
    rollupOptions: {
      maxParallelFileOps: 2,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
  plugins: [react()],
})
