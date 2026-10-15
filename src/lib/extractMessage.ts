const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const field = (value: unknown, key: string): unknown =>
  value !== null && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined;

/** Messages that carry no information for a user; never surface these. */
const GENERIC = new Set(['missing revert data', 'execution reverted', 'estimateGas failed']);

/** Hardhat nests the require message inside the provider error body. */
const REASON_IN_MESSAGE = /reason string '([^']+)'/i;

/** Pull a human-readable message out of anything that gets thrown, preferring the contract's own words. */
export function extractMessage(error: unknown, fallback: string): string {
  const candidates = [
    asString(field(error, 'reason')),
    asString(field(field(error, 'data'), 'message')),
    asString(field(field(field(error, 'info'), 'error'), 'message')),
    asString(field(field(error, 'error'), 'message')),
    asString(field(error, 'shortMessage')),
    error instanceof Error ? error.message : null,
    asString(error),
  ].filter((candidate): candidate is string => candidate !== null);

  for (const candidate of candidates) {
    const match = REASON_IN_MESSAGE.exec(candidate);
    if (match) return match[1];
  }

  return candidates.find((candidate) => !GENERIC.has(candidate)) ?? fallback;
}
