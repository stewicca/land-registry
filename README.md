# Land Registry

Blockchain-based land parcel registry: parcel registration, chain of title, document hashes, and dispute status, with administrative actions restricted to authorized wallets.

Frontend base: own React boilerplate (React 19 + Vite + Redux Toolkit + shadcn/ui). Contract toolchain: Hardhat, Solidity 0.8.24, ethers v6.

## Stack

| Layer | Technology |
|---|---|
| Contract | Solidity 0.8.24 on Hardhat 2 |
| Chain client | ethers v6 in the browser, signed by the user's wallet |
| Framework | React 19 + TypeScript + Vite 6 |
| State | Redux Toolkit |
| Routing | React Router v7 |
| UI | shadcn/ui + Tailwind CSS v4 |
| Testing | Hardhat Mocha/Chai for contracts, Vitest for the app |

There is no backend. Authorization is enforced by the contract and signed in the wallet, so `onlyAdmin` and `onlyOwner` mean what they say.

## Layout

```
contracts/          Solidity sources
scripts/            deploy and seed scripts
test/               Hardhat contract tests
src/lib/chain/      wallet and contract access
src/features/       feature slices (wallet, land, ui)
src/pages/          one file per route
```

## Commands

```bash
pnpm install
pnpm hardhat compile
pnpm hardhat node                                   # terminal 1
pnpm hardhat test                                   # contract suite
pnpm hardhat run scripts/fund.cjs                   # local node only: sends gas to the admin account
pnpm hardhat run scripts/deploy.cjs --network localhost
pnpm hardhat run scripts/seed.cjs --network localhost
pnpm dev                                            # http://localhost:5173
pnpm typecheck && pnpm lint && pnpm test
```

## Admin account

The contract sets `admin` to whoever deploys it, and the accepted function list has no way to hand
that role over. So the deployer decides the admin: put the private key of the account that should
administer the registry in `DEPLOYER_KEY` in `.env`, and `scripts/fund.cjs` gives it gas on the local
node. Leave the value empty to fall back to the node's own accounts, in which case the first Hardhat
account is the admin.

The same account must be imported into the browser wallet for the app to sign admin transactions.
Owners and the notary are fixed addresses from the Hardhat default set, printed by `scripts/seed.cjs`,
and their private keys appear in the node's own startup output.

## Environment

| Variable | Description |
|---|---|
| `VITE_CHAIN_ID` | Chain the frontend expects, 31337 for the local Hardhat node |
| `VITE_RPC_URL` | Read-only JSON-RPC endpoint, so the public pages work without a wallet |
| `VITE_AUDITOR_ADDRESSES`, `VITE_BANK_ADDRESSES` | Comma-separated addresses; these two roles live in the app layer |

`src/contracts/landRegistryAbi.json` and `src/contracts/contract-address.json` are written by `scripts/deploy.cjs` and committed, so the app typechecks and builds before a node is running.

The local Hardhat node is ephemeral: restarting it discards every parcel, so deploy and seed again. A first deploy from the default account lands on the same deterministic address, which is usually why the committed address still matches.
