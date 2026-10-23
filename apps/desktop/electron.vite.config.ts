import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import type { Plugin } from 'vite'

/**
 * Development needs Vite's inline React refresh preamble. Production must not
 * allow inline scripts, so the CSP placeholder is resolved per build mode.
 */
function cspPlugin(): Plugin {
  let isDevelopment = false

  return {
    name: 'base-case-csp',
    configResolved(config) {
      isDevelopment = config.command === 'serve'
    },
    transformIndexHtml(html) {
      const scriptSource = isDevelopment ? "'self' 'unsafe-inline'" : "'self'"
      return html.replace('__CSP_SCRIPT_SRC__', scriptSource)
    },
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['@base-case/schema', 'zod'] })],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
      },
    },
    plugins: [tailwindcss(), react(), cspPlugin()],
  },
})
