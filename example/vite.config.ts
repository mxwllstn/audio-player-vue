import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@mxwllstn/audio-player-vue': path.resolve(__dirname, '../packages/audio-player-vue/src'),
    },
  },
})
