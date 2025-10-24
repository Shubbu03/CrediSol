import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any, { isServer }: any) => {
    if (!isServer) {
      config.plugins.push(
        new NodePolyfillPlugin({
          excludeAliases: ['console'] // Optional: exclude any polyfills you don't need
        })
      );
    }
    return config;
  }
};

module.exports = nextConfig;