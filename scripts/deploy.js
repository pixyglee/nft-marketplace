
const hre = require("hardhat");

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = hre.ethers.parseEther("0.001");

  const NFTMarketPlace = await hre.ethers.deployContract("NFTMarketPlace");

  await NFTMarketPlace.waitForDeployment();

  console.log(
    `NFTMarketPlace with deployed to ${NFTMarketPlace.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => {
    console.log("Script finished successfully.");
  })
  .catch((error) => {
    console.error("Error executing script:", error);
    process.exitCode = 1;
  });
