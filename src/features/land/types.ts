export const LAND_STATUS = { AKTIF: 0n, SENGKETA: 1n, DIBATALKAN: 2n } as const;

export type LandStatusName = keyof typeof LAND_STATUS | 'UNKNOWN';

export interface LandParcel {
  id: number;
  coordinates: string;
  area: bigint;
  owner: string;
  status: LandStatusName;
  registeredAt: number;
  history: string[];
  documentHashes: string[];
}

interface LandRecordLike {
  coordinates: unknown;
  area: unknown;
  owner: unknown;
  status: unknown;
  registeredAt: unknown;
  history: unknown;
  documentHashes: unknown;
}

const STATUS_NAMES: Record<string, LandStatusName> = {
  '0': 'AKTIF',
  '1': 'SENGKETA',
  '2': 'DIBATALKAN',
};

export const statusName = (value: bigint): LandStatusName =>
  STATUS_NAMES[value.toString()] ?? 'UNKNOWN';

const toStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((entry) => String(entry)) : [];

export const toLandParcel = (id: number, record: LandRecordLike): LandParcel => ({
  id,
  coordinates: String(record.coordinates),
  area: BigInt(record.area as bigint),
  owner: String(record.owner),
  status: statusName(BigInt(record.status as bigint)),
  registeredAt: Number(record.registeredAt),
  history: toStringList(record.history),
  documentHashes: toStringList(record.documentHashes),
});
