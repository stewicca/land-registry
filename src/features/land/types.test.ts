import { describe, expect, it } from 'vitest';
import { statusName, toLandParcel } from './types';

const record = {
  coordinates: '-6914700,10760980;-6913700,10760980;-6913700,10761980;-6914700,10761980',
  area: 250n,
  owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  status: 1n,
  registeredAt: 1760000000n,
  history: ['0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'],
  documentHashes: ['QmSeedCertificate0001'],
};

describe('land types', () => {
  it('maps contract status values to names, and refuses to guess', () => {
    expect(statusName(0n)).toBe('AKTIF');
    expect(statusName(1n)).toBe('SENGKETA');
    expect(statusName(2n)).toBe('DIBATALKAN');
    expect(statusName(9n)).toBe('UNKNOWN');
  });

  it('normalizes a contract record into a parcel', () => {
    const parcel = toLandParcel(3, record);

    expect(parcel).toEqual({
      id: 3,
      coordinates: record.coordinates,
      area: 250n,
      owner: record.owner,
      status: 'SENGKETA',
      registeredAt: 1760000000,
      history: record.history,
      documentHashes: record.documentHashes,
    });
  });

  it('survives a record with no documents and a single owner', () => {
    const parcel = toLandParcel(1, { ...record, status: 0n, history: [record.owner], documentHashes: [] });

    expect(parcel.status).toBe('AKTIF');
    expect(parcel.history).toHaveLength(1);
    expect(parcel.documentHashes).toEqual([]);
  });
});
