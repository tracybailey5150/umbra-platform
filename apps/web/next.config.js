/** @type {import('next').NextConfig} */
const nextConfig = {
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
