/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {},

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'anshveersingh.vercel.app',
          },
        ],
        destination: 'https://anshveersingh.in/:path*',
        permanent: false, // CRITICAL FIX: This makes it temporary
      },
    ];
  },
};

export default nextConfig;