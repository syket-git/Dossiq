import type { NextConfig } from "next";

// FastAPI backend (the enterprise-rag-backend folder next to this one).
const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    // Chat answers and document ingestion can take a while.
    proxyTimeout: 180_000,
  },
  // Proxy API calls to FastAPI, so the browser talks to one origin (no CORS needed).
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      { source: "/health/:path*", destination: `${API_URL}/health/:path*` },
    ];
  },
};

export default nextConfig;
