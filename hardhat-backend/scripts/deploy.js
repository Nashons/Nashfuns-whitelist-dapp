const { ethers } = require("hardhat");

async function main(){
  /**
   * A contractFactory in ethers.js is an abstraction used to deploy new smart contracts, so WhiteListContract 
   * here is a factory for instances of our Whitelist contract
   */

  const WhiteListContract = await ethers.getContractFactory("Whitelist");

  //here we deploy the contract
  //100 is the max No of allowed whitelisted addresses
  const deployedWhiteListContract = await WhiteListContract.deploy(100);

  //wait for it to finish deploying
  await deployedWhiteListContract.deployed();

  //print the address of the deployed contract
  console.log(
    "White list contract Address:", deployedWhiteListContract.address
  );

}

//call the main function and catch if theirs an error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });