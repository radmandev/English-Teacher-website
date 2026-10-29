import type { NextConfig } from "next";

const config: NextConfig = {
  // Shared hosting (Hostinger/CloudLinux) caps an account at ~120 threads while reporting 48 cores.
  // Next defaults to cores-1 build workers, each a full Node process, which exhausts that cap.
  experimental: { cpus: 1 },
  async redirects() {
    return [{ source: "/", destination: "/ar", permanent: false }];
  },
};

export default config;
