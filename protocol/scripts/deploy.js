// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  // Deploy protocol token, pass to factory
  const token = await (await hre.ethers.deployContract("ProtocolToken", [], {
    value: hre.ethers.parseEther("0.00"),
  })).waitForDeployment();

  const lock = await hre.ethers.deployContract("Factory", [token.target], {
    value: hre.ethers.parseEther("0.00"),
  });

  const contract = await lock.waitForDeployment();

  const factory = await hre.ethers.getContractAt("Factory", contract.target)


  console.log("Factory: " + contract.target)
  const treasuryAddress = await factory.treasuryAddress()
  //read treasury address from contract
  console.log("treasuryAddress", treasuryAddress, "DEF", await factory.fallbackAddress())

  console.log("tokenAddress", await factory.protocolToken())


  const treasury = await hre.ethers.getContractAt("Treasury", treasuryAddress)

  console.log(await treasury.protocolToken())


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
