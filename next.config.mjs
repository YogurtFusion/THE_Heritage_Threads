/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.29.10", "localhost", "192.168.56.1"],
  images: {
    remotePatterns: [],
  },
  // Allow serving uploaded images from /public/uploads
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
