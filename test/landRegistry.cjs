const { expect } = require("chai");
const { ethers } = require("hardhat");

const STATUS = { AKTIF: 0n, SENGKETA: 1n, DIBATALKAN: 2n };

const square = (x, y, size = 1000) => [
  [x, y],
  [x + size, y],
  [x + size, y + size],
  [x, y + size],
];

const path = (points) => points.map(([x, y]) => `${x},${y}`).join(";");

const PARCEL = path(square(-6914700, 10760980));
const OVERLAPPING = path(square(-6914200, 10761480));
const TOUCHING = path(square(-6913700, 10760980));
const DISJOINT = path(square(-6940000, 10770000));

async function deployRegistry() {
  const [admin, owner, buyer, notary, stranger] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("LandRegistry");
  const registry = await factory.deploy();
  await registry.waitForDeployment();

  return { registry, admin, owner, buyer, notary, stranger };
}

async function deployWithParcel() {
  const context = await deployRegistry();
  await context.registry.registerLand(PARCEL, 250, context.owner.address);
  return context;
}

describe("registerLand", function () {
  it("stores the parcel and emits LandRegistered", async function () {
    const { registry, owner } = await deployWithParcel();

    await expect(registry.registerLand(DISJOINT, 900, owner.address))
      .to.emit(registry, "LandRegistered")
      .withArgs(2, owner.address, DISJOINT);

    const parcel = await registry.getLandDetails(1);
    expect(parcel.id).to.equal(1n);
    expect(parcel.coordinates).to.equal(PARCEL);
    expect(parcel.area).to.equal(250n);
    expect(parcel.owner).to.equal(owner.address);
    expect(parcel.status).to.equal(STATUS.AKTIF);
    expect(parcel.history).to.deep.equal([owner.address]);
    expect(parcel.documentHashes).to.deep.equal([]);
    expect(await registry.getTotalRegisteredLands()).to.equal(2n);
  });

  it("rejects a parcel that overlaps an existing one", async function () {
    const { registry, buyer } = await deployWithParcel();

    await expect(registry.registerLand(OVERLAPPING, 250, buyer.address)).to.be.revertedWith(
      "parcel overlaps an existing parcel",
    );
    expect(await registry.getTotalRegisteredLands()).to.equal(1n);
  });

  it("rejects a parcel that only shares an edge with an existing one", async function () {
    const { registry, buyer } = await deployWithParcel();

    await expect(registry.registerLand(TOUCHING, 250, buyer.address)).to.be.revertedWith(
      "parcel overlaps an existing parcel",
    );
  });

  it("accepts a parcel that does not touch an existing one", async function () {
    const { registry, buyer } = await deployWithParcel();

    await registry.registerLand(DISJOINT, 400, buyer.address);

    expect(await registry.getLandOwner(2)).to.equal(buyer.address);
  });

  it("is restricted to the admin", async function () {
    const { registry, owner, stranger } = await deployWithParcel();

    await expect(
      registry.connect(stranger).registerLand(DISJOINT, 400, owner.address),
    ).to.be.revertedWith("only admin");
  });

  it("rejects an empty owner, an empty area, and too few points", async function () {
    const { registry, owner } = await deployRegistry();

    await expect(
      registry.registerLand(PARCEL, 250, ethers.ZeroAddress),
    ).to.be.revertedWith("owner required");
    await expect(registry.registerLand(PARCEL, 0, owner.address)).to.be.revertedWith("area required");
    await expect(registry.registerLand("1,2;3,4", 250, owner.address)).to.be.revertedWith(
      "at least 3 coordinate pairs required",
    );
  });

  it("rejects a malformed coordinate string", async function () {
    const { registry, owner } = await deployRegistry();

    await expect(registry.registerLand("", 250, owner.address)).to.be.revertedWith(
      "coordinates required",
    );
    await expect(registry.registerLand("1,2;3,x;5,6", 250, owner.address)).to.be.revertedWith(
      "malformed coordinates",
    );
    await expect(registry.registerLand("1,2;3,", 250, owner.address)).to.be.revertedWith(
      "malformed coordinates",
    );
    await expect(registry.registerLand("1,2;3,4;5", 250, owner.address)).to.be.revertedWith(
      "at least 3 coordinate pairs required",
    );
  });
});

describe("addLandDocument", function () {
  it("lets the admin and the owner attach a document hash", async function () {
    const { registry, owner } = await deployWithParcel();

    await expect(registry.addLandDocument(1, "QmCertificate"))
      .to.emit(registry, "LandDocumentAdded")
      .withArgs(1, "QmCertificate");
    await registry.connect(owner).addLandDocument(1, "QmSurvey");

    expect(await registry.getLandDocuments(1)).to.deep.equal(["QmCertificate", "QmSurvey"]);
  });

  it("rejects an unrelated account, an unknown parcel, and an empty hash", async function () {
    const { registry, stranger } = await deployWithParcel();

    await expect(registry.connect(stranger).addLandDocument(1, "Qm")).to.be.revertedWith(
      "only admin or land owner",
    );
    await expect(registry.addLandDocument(9, "Qm")).to.be.revertedWith("land does not exist");
    await expect(registry.addLandDocument(1, "")).to.be.revertedWith("document hash required");
  });
});

describe("registerNotary", function () {
  it("registers a notary once", async function () {
    const { registry, notary } = await deployRegistry();

    await expect(registry.registerNotary(notary.address))
      .to.emit(registry, "NotaryRegistered")
      .withArgs(notary.address);

    expect(await registry.notaries(notary.address)).to.equal(true);
    await expect(registry.registerNotary(notary.address)).to.be.revertedWith(
      "notary already registered",
    );
    await expect(registry.registerNotary(ethers.ZeroAddress)).to.be.revertedWith("notary required");
  });

  it("is restricted to the admin", async function () {
    const { registry, notary, stranger } = await deployRegistry();

    await expect(registry.connect(stranger).registerNotary(notary.address)).to.be.revertedWith(
      "only admin",
    );
  });
});

describe("reads", function () {
  it("reports dispute status from the land status", async function () {
    const { registry } = await deployWithParcel();

    expect(await registry.isLandDisputed(1)).to.equal(false);
    await registry.updateLandStatus(1, STATUS.SENGKETA);
    expect(await registry.isLandDisputed(1)).to.equal(true);
    await registry.updateLandStatus(1, STATUS.AKTIF);
    expect(await registry.isLandDisputed(1)).to.equal(false);
  });

  it("rejects reads for an unknown parcel", async function () {
    const { registry } = await deployRegistry();

    await expect(registry.getLandDetails(1)).to.be.revertedWith("land does not exist");
    await expect(registry.getLandOwner(1)).to.be.revertedWith("land does not exist");
    await expect(registry.getLandDocuments(1)).to.be.revertedWith("land does not exist");
    await expect(registry.isLandDisputed(1)).to.be.revertedWith("land does not exist");
    expect(await registry.getTotalRegisteredLands()).to.equal(0n);
  });
});

describe("transferOwnership", function () {
  it("moves ownership and appends the chain of title", async function () {
    const { registry, owner, buyer } = await deployWithParcel();

    await expect(registry.connect(owner).transferOwnership(1, buyer.address))
      .to.emit(registry, "OwnershipTransferred")
      .withArgs(1, owner.address, buyer.address);

    const parcel = await registry.getLandDetails(1);
    expect(parcel.owner).to.equal(buyer.address);
    expect(parcel.history).to.deep.equal([owner.address, buyer.address]);
  });

  it("lets a registered notary confirm the transfer", async function () {
    const { registry, buyer, notary } = await deployWithParcel();
    await registry.registerNotary(notary.address);

    await registry.connect(notary).transferOwnership(1, buyer.address);

    expect(await registry.getLandOwner(1)).to.equal(buyer.address);
  });

  it("rejects an unrelated account, the same owner, the zero address, and a revoked parcel", async function () {
    const { registry, owner, buyer, stranger } = await deployWithParcel();

    await expect(registry.connect(stranger).transferOwnership(1, buyer.address)).to.be.revertedWith(
      "only owner or notary",
    );
    await expect(registry.connect(owner).transferOwnership(1, owner.address)).to.be.revertedWith(
      "new owner must differ from current owner",
    );
    await expect(
      registry.connect(owner).transferOwnership(1, ethers.ZeroAddress),
    ).to.be.revertedWith("new owner required");

    await registry.revokeLandRegistration(1);
    await expect(registry.connect(owner).transferOwnership(1, buyer.address)).to.be.revertedWith(
      "registration revoked",
    );
  });
});

describe("updateLandStatus", function () {
  it("accepts every declared status and rejects an unknown one", async function () {
    const { registry } = await deployWithParcel();

    await registry.updateLandStatus(1, STATUS.DIBATALKAN);
    expect((await registry.getLandDetails(1)).status).to.equal(STATUS.DIBATALKAN);
    await registry.updateLandStatus(1, STATUS.AKTIF);
    expect((await registry.getLandDetails(1)).status).to.equal(STATUS.AKTIF);

    await expect(registry.updateLandStatus(1, 3)).to.be.revertedWith("unknown status");
  });

  it("is restricted to the admin", async function () {
    const { registry, owner } = await deployWithParcel();

    await expect(registry.connect(owner).updateLandStatus(1, STATUS.SENGKETA)).to.be.revertedWith(
      "only admin",
    );
  });
});

describe("updateLandArea", function () {
  it("revises the area and rejects a zero value", async function () {
    const { registry } = await deployWithParcel();

    await registry.updateLandArea(1, 275);
    expect((await registry.getLandDetails(1)).area).to.equal(275n);

    await expect(registry.updateLandArea(1, 0)).to.be.revertedWith("area required");
  });

  it("is restricted to the admin", async function () {
    const { registry, owner } = await deployWithParcel();

    await expect(registry.connect(owner).updateLandArea(1, 300)).to.be.revertedWith("only admin");
  });
});

describe("revokeLandRegistration", function () {
  it("marks the parcel as revoked and refuses a second revoke", async function () {
    const { registry } = await deployWithParcel();

    await registry.revokeLandRegistration(1);

    expect((await registry.getLandDetails(1)).status).to.equal(STATUS.DIBATALKAN);
    await expect(registry.revokeLandRegistration(1)).to.be.revertedWith(
      "registration already revoked",
    );
  });

  it("is restricted to the admin", async function () {
    const { registry, owner } = await deployWithParcel();

    await expect(registry.connect(owner).revokeLandRegistration(1)).to.be.revertedWith("only admin");
  });
});
