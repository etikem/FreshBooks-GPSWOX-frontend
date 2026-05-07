/** @type {import('next').NextConfig} */
// Frontend ↔ backend API contract:
//   Frontend code calls relative paths under /api (see lib/api.ts).
//   Next.js rewrites /api/:path* to the backend's /admin/:path* mount
//   (see backend/src/index.ts and backend/src/routes/admin.routes.ts).
// If you change either prefix, change both.
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    return [
      { source: '/api/:path*', destination: `${api}/admin/:path*` },
    ];
  },
};

module.exports = nextConfig;
