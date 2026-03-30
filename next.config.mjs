/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {

    serverComponentsExternalPackages: ["pdf-parse", "pdfkit"], 
  },
};

export default nextConfig;