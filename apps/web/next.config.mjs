/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@music-gem2/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
}

export default nextConfig
