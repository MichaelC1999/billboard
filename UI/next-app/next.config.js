/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  trailingSlash: true,
  output: 'export',
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
}
