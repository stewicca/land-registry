import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import AppLayout, { PageHeader } from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchParcelsThunk } from '@/features/land/landThunks';
import { selectLandError, selectLandStatus, selectParcels } from '@/features/land/landSlice';
import { shortAddress } from '@/lib/format';

export default function AuditPage() {
  const dispatch = useAppDispatch();
  const parcels = useAppSelector(selectParcels);
  const status = useAppSelector(selectLandStatus);
  const error = useAppSelector(selectLandError);
  const [disputedOnly, setDisputedOnly] = useState(false);

  useEffect(() => {
    dispatch(fetchParcelsThunk());
  }, [dispatch]);

  const visible = disputedOnly ? parcels.filter((p) => p.status === 'SENGKETA') : parcels;

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Examiner workspace"
        title="Audit view"
        actions={
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={disputedOnly}
              onChange={(event) => setDisputedOnly(event.target.checked)}
              className="size-4 rounded border-input accent-primary"
            />
            Disputed only
          </label>
        }
      />

      <div className="animate-rise space-y-6">
        <Card className="p-6">
          <p className="max-w-prose text-sm text-muted-foreground">
            Read-only view of every registered parcel: current owner, status, number of recorded
            transfers, and attached documents. Nothing on this page writes to the chain, which is the
            point of the examiner role.
          </p>
        </Card>

        {(status === 'idle' || status === 'loading') && (
          <p role="status" className="text-sm text-muted-foreground">
            Reading parcels from the chain…
          </p>
        )}

        {status === 'error' && (
          <Card className="border-destructive/40 p-6">
            <p className="text-sm font-medium text-foreground">The chain did not answer.</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => dispatch(fetchParcelsThunk())}
            >
              Read again
            </Button>
          </Card>
        )}

        {status === 'ready' && parcels.length === 0 && (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              No parcel is registered on this chain yet.
            </p>
          </Card>
        )}

        {status === 'ready' && parcels.length > 0 && visible.length === 0 && (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              No parcel is under dispute on this chain. Clear the filter to see all of them.
            </p>
          </Card>
        )}

        {status === 'ready' && visible.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Registered parcels with owner, status, recorded transfers, and documents
              </caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-medium">Parcel</th>
                  <th scope="col" className="px-5 py-3 font-medium">Owner</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3 font-medium">Transfers</th>
                  <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">Documents</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((parcel) => (
                  <tr key={parcel.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        to={`/parcels/${parcel.id}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        #{parcel.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {shortAddress(parcel.owner)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={parcel.status} />
                    </td>
                    <td className="px-5 py-3 text-foreground">
                      {Math.max(parcel.history.length - 1, 0)}
                    </td>
                    <td className="hidden px-5 py-3 text-foreground sm:table-cell">
                      {parcel.documentHashes.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
