import contractAddress from '@/contracts/contract-address.json';
import landRegistryAbi from '@/contracts/landRegistryAbi.json';

/** Chain the app expects. Both files in src/contracts/ are rewritten by scripts/deploy.cjs. */
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 31337);

export const CONTRACT_ADDRESS = contractAddress.LandRegistry;

export const LAND_REGISTRY_ABI = landRegistryAbi;
