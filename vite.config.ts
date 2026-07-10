import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';

import { tanstackRouter } from '@tanstack/router-plugin/vite';

import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import * as path from 'node:path';

const config = defineConfig({
    resolve: { tsconfigPaths: true, alias: { '@': path.resolve(__dirname, './src') } },
    plugins: [
        devtools(),
        tailwindcss(),
        tanstackRouter({ target: 'react', autoCodeSplitting: true }),
        viteReact(),
        nodePolyfills({
            include: ['fs', 'net', 'tls'], // Prevent Geotab library from crashing browser builds
        }),
    ],
    base: process.env.NODE_ENV === "production" ? "./" : "/",
});

export default config;
