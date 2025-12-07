import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            }
        }
    },
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                phase1: 'phase-1.html',
                // other phases can be added here as files are created
            }
        }
    }
})
