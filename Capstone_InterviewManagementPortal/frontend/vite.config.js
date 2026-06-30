import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const { API_BASE_URL } = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    server: API_BASE_URL
      ? {
          proxy: {
            '/api': API_BASE_URL,
          },
        }
      : undefined,
  }
})
