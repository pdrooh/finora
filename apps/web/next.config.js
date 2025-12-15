/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@finora/shared', '@finora/supabase'],
  images: {
    domains: ['hklzdawonkilsiedfqnm.supabase.co'],
  },
  
  // Otimizações de performance
  experimental: {
    // Otimizar carregamento de imagens
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  
  // Compressão
  compress: true,
  
  // Otimizações de build
  swcMinify: true,
  
  // Headers de cache e segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
