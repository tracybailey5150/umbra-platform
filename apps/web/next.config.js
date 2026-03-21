const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  transpilePackages: [
    "@umbra/ui",
    "@umbra/db",
    "@umbra/auth",
    "@umbra/agents",
    "@umbra/workflows",
    "@umbra/billing",
    "@umbra/shared",
  ],
  experimental: {
    serverComponentsExternalPackages: ["postgres"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

module.exports = nextConfig;
