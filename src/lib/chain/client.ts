import { BrowserProvider, getAddress, type Eip1193Provider } from 'ethers';

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export const hasWallet = (): boolean =>
  typeof window !== 'undefined' && Boolean(window.ethereum);

const requireWallet = (): Eip1193Provider => {
  if (!hasWallet()) throw new Error('No wallet detected. Install MetaMask and reload.');
  return window.ethereum as Eip1193Provider;
};

const checksummed = (accounts: unknown): string[] =>
  (Array.isArray(accounts) ? accounts : []).map((account) => getAddress(String(account)));

export async function requestAccounts(): Promise<string[]> {
  return checksummed(await requireWallet().request({ method: 'eth_requestAccounts' }));
}

export async function currentAccounts(): Promise<string[]> {
  return checksummed(await requireWallet().request({ method: 'eth_accounts' }));
}

export const getBrowserProvider = (): BrowserProvider => new BrowserProvider(requireWallet());
