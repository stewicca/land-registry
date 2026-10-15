import { describe, expect, it } from 'vitest';
import { extractMessage } from './extractMessage';

/** Shape observed from the local node when a require with a message reverts. */
const hardhatRevert = {
  shortMessage: 'missing revert data',
  info: {
    error: {
      message:
        "VM Exception while processing transaction: reverted with reason string 'parcel overlaps an existing parcel'",
    },
  },
};

describe('extractMessage', () => {
  it('digs the contract reason out of a provider error body', () => {
    expect(extractMessage(hardhatRevert, 'Registration failed')).toBe(
      'parcel overlaps an existing parcel',
    );
  });

  it('prefers an explicit reason over everything else', () => {
    expect(extractMessage({ reason: 'only admin', shortMessage: 'missing revert data' }, 'nope')).toBe(
      'only admin',
    );
  });

  it('never shows a generic provider message to the user', () => {
    expect(extractMessage({ shortMessage: 'missing revert data' }, 'Registration failed')).toBe(
      'Registration failed',
    );
  });

  it('falls back through plain errors and strings', () => {
    expect(extractMessage(new Error('nonce too low'), 'fallback')).toBe('nonce too low');
    expect(extractMessage('wallet rejected', 'fallback')).toBe('wallet rejected');
    expect(extractMessage(undefined, 'fallback')).toBe('fallback');
    expect(extractMessage({}, 'fallback')).toBe('fallback');
  });
});
