/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  env: {
    factoryAddress: '0xCe37A881067c0f83b4a439f0157a7e5dE055DB06',
    exampleProtocol: "0xb9d8838F424A1e898CF041A6269BCfdD1a9dEF64",
    integratorAddress: "0x85d9EfB3D924862D34e56d379FB1ca06eA7B0919",
    protocolTokenAddress: "0x9553d4559b8E914aC98C7DC169DD35F7578626Cb",
    treasuryAddress: "0x3Fb4F880474BB4C47228d8FC5a06E38008DD7494",
    CHAIN_ID: 59140
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
}
