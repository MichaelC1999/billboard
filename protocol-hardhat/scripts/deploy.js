
const hre = require("hardhat");

async function main() {

  // Deploy protocol token, pass to factory
  const token = await (await hre.ethers.deployContract("ProtocolToken", [], {
    value: hre.ethers.parseEther("0.00"),
  })).waitForDeployment();

  const factoryDeploy = await hre.ethers.deployContract("Factory", [token.target], {
    value: hre.ethers.parseEther("0.00"),
  });

  const factoryContract = await factoryDeploy.waitForDeployment();

  const factory = await hre.ethers.getContractAt("Factory", factoryContract.target)


  console.log("Factory: " + factoryContract.target)
  const treasuryAddress = await factory.treasuryAddress()
  console.log("treasuryAddress", treasuryAddress, "DEF", await factory.fallbackAddress())

  console.log("tokenAddress", await factory.protocolToken())


  const treasury = await hre.ethers.getContractAt("Treasury", treasuryAddress)

  console.log(await treasury.protocolToken())

  const MintNFTDeploy = await hre.ethers.deployContract("ExampleIntegrator", [], {
    value: hre.ethers.parseEther("0.00"),
  })

  const MintNFTDeployContract = await MintNFTDeploy.waitForDeployment()

  console.log(" Verify: " + MintNFTDeployContract.target)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
