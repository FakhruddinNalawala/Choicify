/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  rewrites: async () => {
    return [
      {
        source: "/api/:slug*",
        destination: "http://localhost:8080/api/:slug*",
        basePath: false,
      },
    ];
  },
};

module.exports = nextConfig;
