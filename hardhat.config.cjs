require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      // viaIR keeps the polygon geometry helpers from blowing the stack frame.
      viaIR: true,
      optimizer: { enabled: true, runs: 200 },
    },
  },
};
