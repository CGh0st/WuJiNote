import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'app/main/index.js'
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      lib: {
        entry: 'app/preload/index.js'
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: resolve('app/renderer'),
    build: {
      rollupOptions: {
        input: resolve('app/renderer/index.html')
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('app/renderer/src')
      }
    },
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
      }
    },
    plugins: [vue()]
  }
})
