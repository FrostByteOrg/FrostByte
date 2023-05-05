/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['hmmdmicyvzwicpckacld.supabase.co'],
  },
  // async rewrites() {
  //   return {
  //     //might need to change afterFiles => fallback
  //     fallback: [{ source: '/:path*', destination: '/_404/:path*' }],
  //   };
  // },
};

module.exports = nextConfig;
