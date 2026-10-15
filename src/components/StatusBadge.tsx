import { Badge } from '@/components/ui/badge';
import type { LandStatusName } from '@/features/land/types';

const VARIANT: Record<LandStatusName, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  AKTIF: 'default',
  SENGKETA: 'destructive',
  DIBATALKAN: 'outline',
  UNKNOWN: 'outline',
};

/** The label carries the status; the variant only reinforces it, so colour is never the only signal. */
export default function StatusBadge({ status }: { status: LandStatusName }) {
  return <Badge variant={VARIANT[status]}>{status}</Badge>;
}
