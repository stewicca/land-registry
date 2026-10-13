# Land Registry

Blockchain-based land parcel registry: parcel registration, chain of title, document hashes, and dispute status, with administrative actions restricted to authorized wallets.

Frontend base: own React boilerplate (React 19 + Vite + Redux Toolkit + shadcn/ui). Contract toolchain: Hardhat, Solidity 0.8.24, ethers v6. Planning and progress tracking live in `docs/PLAN.md`.

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
docs/PLAN.md        implementation plan and phase checklist
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
pnpm hardhat run scripts/deploy.cjs --network localhost
pnpm hardhat run scripts/seed.cjs --network localhost
pnpm dev                                            # http://localhost:5173
pnpm typecheck && pnpm lint && pnpm test
```

## Environment

| Variable | Description |
|---|---|
| `VITE_CHAIN_ID` | Chain the frontend expects, 31337 for the local Hardhat node |
| `VITE_CONTRACT_ADDRESS` | Written by `scripts/deploy.cjs` after every deploy |

The local Hardhat node is ephemeral: restarting it discards all parcels and changes the contract address, so deploy and seed again.
