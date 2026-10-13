import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import AppLayout, { PageHeader } from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchParcelsThunk } from '@/features/land/landThunks';
import { selectLandError, selectLandStatus, selectParcels } from '@/features/land/landSlice';
import type { LandStatusName } from '@/features/land/types';
import { selectIsFetching } from '@/features/ui/uiSlice';

const STATUS_VARIANT: Record<LandStatusName, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  AKTIF: 'default',
  SENGKETA: 'destructive',
  DIBATALKAN: 'outline',
  UNKNOWN: 'outline',
};

const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export default function ParcelsPage() {
  const dispatch = useAppDispatch();
  const parcels = useAppSelector(selectParcels);
  const status = useAppSelector(selectLandStatus);
  const error = useAppSelector(selectLandError);
  const isFetching = useAppSelector(selectIsFetching);

  useEffect(() => {
    dispatch(fetchParcelsThunk());
  }, [dispatch]);

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Public record"
        title="Registered parcels"
        actions={
          <Button variant="outline" size="sm" onClick={() => dispatch(fetchParcelsThunk())} disabled={isFetching}>
            {isFetching ? 'Reading…' : 'Read again'}
          </Button>
        }
      />

      {(status === 'idle' || status === 'loading') && (
        <p role="status" className="animate-fade text-sm text-muted-foreground">
          Reading parcels from the chain…
        </p>
      )}

      {status === 'error' && (
        <Card className="animate-rise border-destructive/40 p-6">
          <p className="text-sm font-medium text-foreground">The chain did not answer.</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Start the node with <code className="font-mono">pnpm exec hardhat node</code>, then read again.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => dispatch(fetchParcelsThunk())}>
            Read again
          </Button>
        </Card>
      )}

      {status === 'ready' && parcels.length === 0 && (
        <Card className="animate-rise p-6">
          <p className="text-sm font-medium text-foreground">Nothing is registered on this chain yet.</p>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Parcels appear here after an admin registers them. The contract rejects a parcel that overlaps a
            registered one, so this list is the record.
          </p>
        </Card>
      )}

      {status === 'ready' && parcels.length > 0 && (
        <div className="animate-rise overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Registered parcels with area, status, and current owner</caption>
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-5 py-3 font-medium">Parcel</th>
                <th scope="col" className="px-5 py-3 font-medium">Area</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">Owner</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((parcel) => (
                <tr key={parcel.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3">
                    <Link
                      to={`/parcels/${parcel.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      #{parcel.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-foreground">{parcel.area.toString()} m²</td>
                  <td className="px-5 py-3">
                    <Badge variant={STATUS_VARIANT[parcel.status]}>{parcel.status}</Badge>
                  </td>
                  <td className="hidden px-5 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                    {shortAddress(parcel.owner)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
