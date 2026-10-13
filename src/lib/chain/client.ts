import { BrowserProvider, Contract, getAddress, type Eip1193Provider } from 'ethers';
import { CONTRACT_ADDRESS, LAND_REGISTRY_ABI } from './config';

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

export async function getRegistry(withSigner = false): Promise<LandRegistryContract> {
  const provider = getProvider();
  const runner = withSigner ? await provider.getSigner() : provider;
  return new Contract(CONTRACT_ADDRESS, LAND_REGISTRY_ABI, runner) as LandRegistryContract;
}
