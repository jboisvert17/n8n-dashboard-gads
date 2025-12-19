/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour le déploiement
  output: 'standalone',
  
  // Variables d'environnement exposées au client
  env: {
    NEXT_PUBLIC_N8N_URL: process.env.NEXT_PUBLIC_N8N_URL || 'https://votre-n8n.exemple.com',
    NEXT_PUBLIC_NOCODB_URL: process.env.NEXT_PUBLIC_NOCODB_URL || 'https://votre-nocodb.exemple.com',
  },
}

export default nextConfig


