const fs = require("fs");
const path = require("path");

const NOTARY_INDEX = 3;
const STAFF_INDEX = 4;

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
  { coordinates: path_(square(ORIGIN_X, ORIGIN_Y, SIZE)), area: 250, ownerIndex: 1 },
  { coordinates: path_(square(ORIGIN_X, ORIGIN_Y + 2000, SIZE)), area: 300, ownerIndex: 2 },
  { coordinates: path_(square(ORIGIN_X, ORIGIN_Y + 4000, SIZE)), area: 400, ownerIndex: 1 },
];

async function main() {
  const address = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "src", "contracts", "contract-address.json"), "utf8"),
  ).LandRegistry;

  const signers = await ethers.getSigners();
  const registry = await ethers.getContractAt("LandRegistry", address, signers[0]);

  const registered = await registry.getTotalRegisteredLands();
  if (registered > 0n) {
    console.log(`Skipping seed: ${registered} parcel(s) already registered.`);
    return;
  }

  console.log("Seeding", address);
  await (await registry.registerNotary(signers[NOTARY_INDEX].address)).wait();
  console.log("Notary registered:", signers[NOTARY_INDEX].address);

  for (const [index, parcel] of PARCELS.entries()) {
    const owner = signers[parcel.ownerIndex].address;
    await (await registry.registerLand(parcel.coordinates, parcel.area, owner)).wait();
    console.log(`Parcel ${index + 1} registered for`, owner);
  }

  await (await registry.addLandDocument(1, "QmSeedCertificate0001")).wait();
  await (await registry.updateLandStatus(2, 1)).wait();
  console.log("Parcel 1 got a document hash, parcel 2 is marked disputed");

  console.log("Staff account (not a role in the contract):", signers[STAFF_INDEX].address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
