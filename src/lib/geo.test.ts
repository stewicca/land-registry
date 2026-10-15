import { describe, expect, it } from 'vitest';
import { countVertices, isAddress, isPositiveNumber, toScaledCoordinates } from './geo';

describe('toScaledCoordinates', () => {
  it('scales degrees to the integer form the contract parses', () => {
    expect(toScaledCoordinates('-6.9147,106.9098;-6.9147,106.9108;-6.9157,106.9108')).toBe(
      '-6914700,106909800;-6914700,106910800;-6915700,106910800',
    );
  });

  it('rounds to six decimals and tolerates spacing', () => {
    expect(toScaledCoordinates(' -6.9147001 , 106.9098004 ; -6.9147,106.9098 ')).toBe(
      '-6914700,106909800;-6914700,106909800',
    );
  });

  it('counts vertices and rejects nothing silently', () => {
    expect(countVertices(toScaledCoordinates('1,2;3,4;5,6'))).toBe(3);
    expect(countVertices(toScaledCoordinates(''))).toBe(0);
    expect(toScaledCoordinates('abc,def')).toBe('NaN,NaN');
  });
});

describe('input guards', () => {
  it('accepts only well-formed addresses', () => {
    expect(isAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')).toBe(true);
    expect(isAddress('0x7099')).toBe(false);
    expect(isAddress('70997970C51812dc3A010C7d01b50e0d17dc79C8')).toBe(false);
  });

  it('accepts only positive numbers', () => {
    expect(isPositiveNumber('250')).toBe(true);
    expect(isPositiveNumber('0')).toBe(false);
    expect(isPositiveNumber('-5')).toBe(false);
    expect(isPositiveNumber('abc')).toBe(false);
  });
});
