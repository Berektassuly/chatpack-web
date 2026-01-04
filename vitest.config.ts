/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '../wasm/chatpack_wasm.js': path.resolve(__dirname, './src/test/wasm_mock.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
