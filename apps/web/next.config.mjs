/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ai-music-player/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
}

export default nextConfig
