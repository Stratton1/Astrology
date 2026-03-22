/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cosmos/ui', '@cosmos/types', '@cosmos/traditions'],
  experimental: {
    // serverActions: true is default in Next 14
  },
  output: 'standalone',
};
module.exports = nextConfig;
