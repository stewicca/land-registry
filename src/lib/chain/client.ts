import { BrowserProvider, Contract, JsonRpcProvider, getAddress, type Eip1193Provider } from 'ethers';
import { CONTRACT_ADDRESS, LAND_REGISTRY_ABI, RPC_URL } from './config';

export type LandRecord = {
  id: bigint;
  coordinates: string;
  area: bigint;
  owner: string;
  status: bigint;
  registeredAt: bigint;
  history: string[];
  documentHashes: string[];
};

interface WalletProvider extends Eip1193Provider {
  on?(event: 'accountsChanged', handler: (accounts: unknown) => void): void;
}

declare global {
  interface Window {
    ethereum?: WalletProvider;
  }
}

export type LandRegistryContract = Contract & {
  admin(): Promise<string>;
  notaries(address: string): Promise<boolean>;
  getTotalRegisteredLands(): Promise<bigint>;
  getLandOwner(landId: number): Promise<string>;
  getLandDetails(landId: number): Promise<LandRecord>;
  getLandDocuments(landId: number): Promise<string[]>;
  isLandDisputed(landId: number): Promise<boolean>;
};

export const hasWallet = (): boolean =>
  typeof window !== 'undefined' && Boolean(window.ethereum);

const requireWallet = (): WalletProvider => {
  if (!hasWallet()) throw new Error('No wallet detected. Install MetaMask and reload.');
  return window.ethereum as WalletProvider;
};

const checksummed = (accounts: unknown): string[] =>
  (Array.isArray(accounts) ? accounts : []).map((account) => getAddress(String(account)));

export async function requestAccounts(): Promise<string[]> {
  return checksummed(await requireWallet().request({ method: 'eth_requestAccounts' }));
}

export async function currentAccounts(): Promise<string[]> {
  return checksummed(await requireWallet().request({ method: 'eth_accounts' }));
}

export async function currentChainId(): Promise<number> {
  const chainId = (await requireWallet().request({ method: 'eth_chainId' })) as string;
  return Number.parseInt(chainId, 16);
}

export function onAccountsChanged(handler: (accounts: string[]) => void): void {
  requireWallet().on?.('accountsChanged', (accounts: unknown) => handler(checksummed(accounts)));
}

export const getProvider = (): BrowserProvider => new BrowserProvider(requireWallet());

let readProvider: JsonRpcProvider | null = null;

/** Reads go over plain JSON-RPC so the public record works without a wallet. */
export function getReadRegistry(): LandRegistryContract {
  readProvider ??= new JsonRpcProvider(RPC_URL);
  return new Contract(CONTRACT_ADDRESS, LAND_REGISTRY_ABI, readProvider) as LandRegistryContract;
}

/** Writes are signed by the connected wallet, which is what makes the access modifiers mean something. */
export async function getSignerRegistry(): Promise<LandRegistryContract> {
  const signer = await getProvider().getSigner();
  return new Contract(CONTRACT_ADDRESS, LAND_REGISTRY_ABI, signer) as LandRegistryContract;
}
