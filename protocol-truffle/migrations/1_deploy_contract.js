const ProtocolToken = artifacts.require("ProtocolToken");
const Factory = artifacts.require("Factory");
const Treasury = artifacts.require("Treasury");

module.exports = async function (deployer) {

    // Deploy protocol token
    await deployer.deploy(ProtocolToken);
    const token = await ProtocolToken.deployed();

    // Deploy Factory with the token as an argument
    await deployer.deploy(Factory, token.address);
    const factory = await Factory.deployed();

    // Uncomment if you want to deploy ExampleIntegrator
    // await deployer.deploy(ExampleIntegrator);
    // const ExInt = await ExampleIntegrator.deployed();

    // Print Factory address
    console.log("Factory: ", factory.address);

    // Get treasury address from factory and display it
    const treasuryAddress = await factory.treasuryAddress();
    console.log("treasuryAddress", treasuryAddress, "DEF", await factory.fallbackAddress());

    // Display protocol token address
    console.log("tokenAddress", await factory.protocolToken());

    // Fetch the Treasury contract at the deployed address and display its token
    const treasury = await Treasury.at(treasuryAddress);
    console.log(await treasury.protocolToken());
};
