import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WEB-01 : ancien lien de démo (fiche App Store, emails) vers le slug actuel.
  async redirects() {
    return [{ source: "/sitraka", destination: "/sitraka-rabetsimialona", permanent: false }];
  },
};

export default nextConfig;
