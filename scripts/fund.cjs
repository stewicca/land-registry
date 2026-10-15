const { JsonRpcProvider, Wallet, formatEther, parseEther } = require("ethers");
const { envValue, normalizeKey } = require("./env.cjs");

/** Hardhat's first account, unlocked by the node, used only to hand gas to the deployer. */
const FUNDING_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const MINIMUM = parseEther("1");
const TOP_UP = parseEther("100");

/** Read the balance straight from the node: the provider's cached latest block reports stale values right after a transfer. */
const readBalance = async (provider, address) =>
  BigInt(await provider.send("eth_getBalance", [address, "latest"]));

async function main() {
  const key = normalizeKey(envValue("DEPLOYER_KEY"));
  if (!key) {
    throw new Error("Set DEPLOYER_KEY in .env before running this script.");
  }

  const provider = new JsonRpcProvider("http://127.0.0.1:8545");
  const admin = new Wallet(key).address;

  console.log("Deployer and admin address:", admin);
  console.log("Balance:", formatEther(await readBalance(provider, admin)), "ETH");

  if ((await readBalance(provider, admin)) >= MINIMUM) {
    console.log("Already funded, nothing to do.");
    return;
  }

  const hash = await provider.send("eth_sendTransaction", [
    { from: FUNDING_ADDRESS, to: admin, value: `0x${TOP_UP.toString(16)}` },
  ]);
  await provider.waitForTransaction(hash);

  console.log("Funded from", FUNDING_ADDRESS);
  console.log("New balance:", formatEther(await readBalance(provider, admin)), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
