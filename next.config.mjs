import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/**' },
      { protocol: 'https', hostname: 'v2.exercisedb.io', pathname: '/**' },
      { protocol: 'https', hostname: '**.exercisedb.io', pathname: '/**' },
      { protocol: 'https', hostname: 'wger.de', pathname: '/**' },
    ],
  },
};
 
export default withNextIntl(nextConfig);