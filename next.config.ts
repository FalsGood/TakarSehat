/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aktifkan strict mode React untuk deteksi dini bug
  reactStrictMode: true,

  // Konfigurasi gambar eksternal (tambah domain jika perlu)
  images: {
    domains: [],
  },
};

export default nextConfig;
