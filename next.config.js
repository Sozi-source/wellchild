/** @type {import('next').NextConfig} */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledJsx: false,
  },
  webpack: (config, { isServer }) => {
    // Force webpack to resolve styled-jsx from your node_modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-jsx': path.resolve(__dirname, 'node_modules/styled-jsx'),
      'styled-jsx/style': path.resolve(__dirname, 'node_modules/styled-jsx/style'),
    };
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  output: 'standalone',
  images: {
    domains: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  },
};

export default nextConfig;