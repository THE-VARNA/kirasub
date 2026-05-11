import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Handle ESM packages
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: { fullySpecified: false },
    });
    return config;
  },
  serverExternalPackages: ["@coral-xyz/anchor"],
};

export default nextConfig;
