const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

export const isAddress = (value: string): boolean => ADDRESS_PATTERN.test(value.trim());

export const isPositiveNumber = (value: string): boolean => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
};

/** Coordinates typed in degrees become the scaled integers the contract parses. */
export const toScaledCoordinates = (value: string): string =>
  value
    .trim()
    .split(';')
    .map((pair) => pair.trim())
    .filter((pair) => pair.length > 0)
    .map((pair) => pair.split(',').map((part) => Math.round(Number(part.trim()) * 1e6)).join(','))
    .join(';');

export const countVertices = (coordinates: string): number =>
  coordinates.split(';').filter((pair) => pair.trim().length > 0).length;
