/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/react'],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  images: {
    domains: ['ipfs.io', 'arweave.net', 'gateway.pinata.cloud'],
  },
};

module.exports = nextConfig;
