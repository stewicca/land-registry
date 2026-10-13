import { describe, expect, it } from 'vitest';
import type { RootState } from '@/app/store';
import reducer, {
  connected,
  disconnected,
  selectIsAuthenticated,
  selectIsWrongChain,
  selectUsername,
  setChainId,
} from './walletSlice';

const stateWith = (wallet: ReturnType<typeof reducer>): RootState => ({ wallet } as RootState);

describe('walletSlice', () => {
  it('starts idle without an address', () => {
    expect(reducer(undefined, { type: '@@init' })).toEqual({
      address: null,
      role: null,
      chainId: null,
      status: 'idle',
    });
  });

  it('authenticates once an account is connected', () => {
    const state = reducer(
      undefined,
      connected({ address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', role: 'USER' }),
    );

    expect(state.status).toBe('authenticated');
    expect(selectIsAuthenticated(stateWith(state))).toBe(true);
    expect(selectUsername(stateWith(state))).toBe('0xf39F…2266');
  });

  it('clears the session on disconnect', () => {
    const state = reducer(
      reducer(undefined, connected({ address: '0x0000000000000000000000000000000000000001', role: 'USER' })),
      disconnected(),
    );

    expect(state.status).toBe('unauthenticated');
    expect(state.address).toBeNull();
    expect(selectIsAuthenticated(stateWith(state))).toBe(false);
  });

  it('flags a chain the app is not configured for', () => {
    const local = stateWith(reducer(undefined, setChainId(31337)));
    const elsewhere = stateWith(reducer(undefined, setChainId(1)));

    expect(selectIsWrongChain(local)).toBe(false);
    expect(selectIsWrongChain(elsewhere)).toBe(true);
  });
});
