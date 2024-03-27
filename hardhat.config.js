require("@nomicfoundation/hardhat-toolbox");
const fs = require("fs")
/** @type import('hardhat/config').HardhatUserConfig */

const privateKey = fs.readFileSync('.secret').toString().trim();

module.exports = {
  networks:{
    hardhat:{
      chainId : 1337,
    },
  },
  solidity: "0.8.19",
};
