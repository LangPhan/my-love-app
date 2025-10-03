/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'syd.cloud.appwrite.io',
        port: '',
        pathname: '/v1/storage/buckets/*/files/*/preview**',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
        port: '',
        pathname: '/v1/storage/buckets/*/files/*/preview**',
      },
      {

        protocol: 'https',
        hostname: 'syd.cloud.appwrite.io',
        port: '',
        pathname: '/v1/storage/**',

      }
    ],
  },
};

export default nextConfig;
