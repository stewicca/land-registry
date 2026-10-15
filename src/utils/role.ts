export const ROLES = ['ADMIN', 'NOTARY', 'OWNER', 'AUDITOR', 'BANK', 'USER'] as const;

export type Role = (typeof ROLES)[number];

export const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && (ROLES as readonly string[]).includes(value);

export const isAdmin = (role: Role | null): boolean => role === 'ADMIN';
export const isUser  = (role: Role | null): boolean => role === 'USER';

/** Roles allowed into the administrative workspace. */
export const ADMIN_ROLES: Role[] = ['ADMIN'];

export const hasAnyRole = (role: Role | null, allowed: Role[]): boolean =>
  role !== null && allowed.includes(role);
