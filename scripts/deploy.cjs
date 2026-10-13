const fs = require("fs");
const path = require("path");

async function main() {
  if (network.name === "hardhat") {
    console.warn(
      "Deploying to the in-process network: the address is thrown away when this script exits. Use --network localhost.",
    );
  }

  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("LandRegistry");
  const registry = await factory.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("LandRegistry deployed at", address);
  console.log("Admin account:", deployer.address);

  writeFrontendFiles(address);
}

function writeFrontendFiles(address) {
  const targets = path.join(__dirname, "..", "src", "contracts");
  fs.mkdirSync(targets, { recursive: true });

  const { abi } = artifacts.readArtifactSync("LandRegistry");
  fs.writeFileSync(path.join(targets, "landRegistryAbi.json"), `${JSON.stringify(abi, null, 2)}\n`);
  fs.writeFileSync(
    path.join(targets, "contract-address.json"),
    `${JSON.stringify({ LandRegistry: address }, null, 2)}\n`,
  );
  console.log("Wrote ABI and address to", targets);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
