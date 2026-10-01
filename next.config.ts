import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "sharp", "@node-rs/argon2"],
  poweredByHeader: false,
  // Geliştirme sunucusuna yerel ağdaki başka bir cihazdan (telefon vb.) erişim için: ALLOWED_DEV_ORIGINS=192.168.1.10
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(",").filter(Boolean),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      { source: "/panel/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
