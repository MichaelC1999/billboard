

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

    const Int = await hre.ethers.deployContract("Integrator", ["0x5872f79eAaCDb230EB4Bb1Cf694B86e90769a16e", "nft", ['mintNFT(address)']], {
        value: hre.ethers.parseEther("0.00"),
    })

    const IntContract = await Int.waitForDeployment()

    console.log(" Integrator: " + IntContract.target)



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
