const fs = require("fs");
const path = require("path");

/** Hardhat does not read .env on its own, so the values used by the scripts are loaded here. */
function envValue(name) {
  if (process.env[name]) return process.env[name];

  const file = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(file)) return undefined;

  const line = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .find((entry) => entry.startsWith(`${name}=`));

  return line ? line.slice(name.length + 1).trim() : undefined;
}

/** MetaMask shows private keys without the 0x prefix; ethers wants it. */
function normalizeKey(key) {
  if (!key) return undefined;
  return key.startsWith("0x") ? key : `0x${key}`;
}

module.exports = { envValue, normalizeKey };
