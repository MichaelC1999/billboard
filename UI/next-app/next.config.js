/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  env: {
    factoryAddress: '0xd99820a1Ed7307451A045495b4895c870C336742',
    exampleProtocol: "0xb9d8838F424A1e898CF041A6269BCfdD1a9dEF64",
    integratorAddress: "0x85d9EfB3D924862D34e56d379FB1ca06eA7B0919",
    protocolTokenAddress: "0x0Fee01307489902AcA31B11455A98dD1C5e00Dcd",
    treasuryAddress: "0xF9552b82f833Bb24304FFFad4CBFE808CCf0E06D"
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
}
