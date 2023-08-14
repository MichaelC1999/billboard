/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  trailingSlash: true,
  output: 'export',
  env: {
    factoryAddress: '0x4Fc30D461B0f73680660Ee305882B8E0ddD65199',
    protocolTokenAddress: "0xE94dbD94bcF271a6204f7A00A0a6a761cac710C1",
    treasuryAddress: "0x6BA604cB8166f8D6b48346FB2a87521bBd9C07E0",
    CHAIN_ID: 59140,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
}
