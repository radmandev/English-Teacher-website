import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/ar", permanent: false }];
  },
};

export default config;
