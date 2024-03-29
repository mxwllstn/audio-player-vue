import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dts(), cssInjectedByJsPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/assets/scss/global.scss";`,
      },
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/components/index.ts'),
      name: 'AudioFilePlayer',
      fileName: format => (format === 'es' ? 'audio-player.mjs' : 'audio-player.cjs'),
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
