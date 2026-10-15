require("@nomicfoundation/hardhat-toolbox");

const { envValue, normalizeKey } = require("./scripts/env.cjs");

const deployerKey = normalizeKey(envValue("DEPLOYER_KEY"));

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
  networks: {
    hardhat: {
      // Local development is not supposed to cost anything: with a zero base fee the wallet
      // estimates a fee of roughly nothing. Only affects the local node and the in-process tests.
      initialBaseFeePerGas: 0,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      // With DEPLOYER_KEY set, deploy and seed are signed by that account, and the contract makes
      // that same account the admin. Without it, the node's own unlocked accounts are used.
      accounts: deployerKey ? [deployerKey] : "remote",
    },
  },
};
