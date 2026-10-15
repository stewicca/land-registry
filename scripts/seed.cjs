const fs = require("fs");
const path = require("path");

/**
 * Owners, notary, examiner, and financing officer are fixed addresses rather than signer indexes:
 * deploy and seed are signed by the DEPLOYER_KEY account, so the node's own accounts are not
 * available as signers here. These are the Hardhat default accounts, importable into MetaMask.
 */
const DEMO = {
  ownerOne: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  ownerTwo: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  notary: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  examiner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  financing: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
  stranger: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
};

const square = (x, y, size) => [
  [x, y],
  [x + size, y],
  [x + size, y + size],
  [x, y + size],
];

const path_ = (points) => points.map(([x, y]) => `${x},${y}`).join(";");

const ORIGIN_X = -6914700;
const ORIGIN_Y = 10760980;
const SIZE = 1000;

const PARCELS = [
  { coordinates: path_(square(ORIGIN_X, ORIGIN_Y, SIZE)), area: 250, owner: DEMO.ownerOne },
  { coordinates: path_(square(ORIGIN_X, ORIGIN_Y + 2000, SIZE)), area: 300, owner: DEMO.ownerTwo },
  { coordinates: path_(square(ORIGIN_X, ORIGIN_Y + 4000, SIZE)), area: 400, owner: DEMO.ownerOne },
];

async function main() {
  const address = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "src", "contracts", "contract-address.json"), "utf8"),
  ).LandRegistry;

  const [admin] = await ethers.getSigners();
  const registry = await ethers.getContractAt("LandRegistry", address, admin);

  const registered = await registry.getTotalRegisteredLands();
  if (registered > 0n) {
    console.log(`Skipping seed: ${registered} parcel(s) already registered.`);
    return;
  }

  console.log("Seeding", address, "as admin", await admin.getAddress());
  await (await registry.registerNotary(DEMO.notary)).wait();

  for (const [index, parcel] of PARCELS.entries()) {
    await (await registry.registerLand(parcel.coordinates, parcel.area, parcel.owner)).wait();
    console.log(`Parcel ${index + 1} registered for`, parcel.owner);
  }

  await (await registry.addLandDocument(1, "QmSeedCertificate0001")).wait();
  await (await registry.updateLandStatus(2, 1)).wait();
  console.log("Parcel 1 got a document hash, parcel 2 is marked disputed");

  console.log("Notary:   ", DEMO.notary);
  console.log("Examiner: ", DEMO.examiner, "(app layer role, list it in VITE_AUDITOR_ADDRESSES)");
  console.log("Financing:", DEMO.financing, "(app layer role, list it in VITE_BANK_ADDRESSES)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
