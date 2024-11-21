import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'src/manifest.json', dest: '' } // Copies manifest.json to the dist folder
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),    // Popup entry
        content: resolve(__dirname, 'src/content.js'), // Content script
        background: resolve(__dirname, 'src/background.js'), // Background script
      },
      output: {
        entryFileNames: '[name].js', // Ensure each entry is named properly
      }
    }
  }
})
