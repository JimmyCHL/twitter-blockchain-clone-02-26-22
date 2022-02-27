const hre = require("hardhat");

async function main() {
  const profileImageMinterFactory = await hre.ethers.getContractFactory(
    "ProfileImageNfts"
  );
  const profileImageContract = await profileImageMinterFactory.deploy();

  await profileImageContract.deployed();

  console.log(
    "ProfileImageMinter Contract is deployed to:",
    profileImageContract.address
  );
}

(async () => {
  try {
    await main();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
