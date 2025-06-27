import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // experimental: {
  //   // This resolves the cross-origin request warning in the dev environment.
  //   // This is useful for environments like Firebase Studio / Cloud Workstations.
  //   allowedDevOrigins: ["*.cloudworkstations.dev"],
  // },
};

export default nextConfig;
