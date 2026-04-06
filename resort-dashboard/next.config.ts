import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone/ directory.
  // Required by the Dockerfile — keeps the final image ~150 MB
  // instead of ~500 MB by eliminating the need to copy node_modules.
  output: "standalone",
};

export default nextConfig;
