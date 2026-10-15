import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import AppLayout, { PageHeader } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';
import { fetchParcelThunk } from '@/features/land/landThunks';
import { selectLandError, selectLandStatus, selectSelectedParcel } from '@/features/land/landSlice';


const formatRegistered = (seconds: number) =>
  new Date(seconds * 1000).toLocaleDateString(undefined, { dateStyle: 'medium' });

export default function ParcelDetailPage() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const landId = Number(id);
  const isReadableId = Number.isInteger(landId) && landId > 0;
  const parcel = useAppSelector(selectSelectedParcel);
  const status = useAppSelector(selectLandStatus);
  const error = useAppSelector(selectLandError);

  useEffect(() => {
    if (isReadableId) dispatch(fetchParcelThunk(landId));
  }, [dispatch, isReadableId, landId]);

  const unresolved = !isReadableId || status === 'not-registered';
  const message = isReadableId ? error : `Parcel "${id}" is not a parcel number.`;

  return (
    <AppLayout>
      <PageHeader eyebrow="Parcel record" title={`Parcel #${id ?? 'unknown'}`} />

      {!unresolved && (status === 'idle' || status === 'loading') && (
        <p role="status" className="animate-fade text-sm text-muted-foreground">
          Reading parcel #{id} from the chain…
        </p>
      )}

      {!unresolved && status === 'error' && (
        <Card className="animate-rise border-destructive/40 p-6">
          <p className="text-sm font-medium text-foreground">The chain did not answer.</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => dispatch(fetchParcelThunk(landId))}>
            Read again
          </Button>
        </Card>
      )}

      {unresolved && (
        <Card className="animate-rise p-6">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Registered parcels are listed on the parcel index.
          </p>
          <Link
            to="/parcels"
            className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to all parcels
          </Link>
        </Card>
      )}

      {!unresolved && status === 'ready' && parcel && (
        <div className="animate-rise space-y-6">
          <Card className="p-6">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Current owner</dt>
                <dd className="mt-1 font-mono text-sm break-all text-foreground">{parcel.owner}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={parcel.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Area</dt>
                <dd className="mt-1 text-sm text-foreground">{parcel.area.toString()} m²</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Registered</dt>
                <dd className="mt-1 text-sm text-foreground">{formatRegistered(parcel.registeredAt)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Boundary, degrees scaled by 10⁶
                </dt>
                <dd className="mt-1 font-mono text-xs break-all text-muted-foreground">
                  {parcel.coordinates}
                </dd>
              </div>
            </dl>
          </Card>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Chain of title</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {parcel.history.length === 1
                ? 'One owner since registration, no transfer recorded.'
                : `${parcel.history.length} owners in order, oldest first.`}
            </p>
            <ol className="mt-4 space-y-3">
              {parcel.history.map((owner, index) => (
                <li key={`${owner}-${index}`} className="flex items-baseline gap-4">
                  <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="font-mono text-xs break-all text-foreground">{owner}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Documents</h2>
            {parcel.documentHashes.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                No document hashes are attached to this parcel.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {parcel.documentHashes.map((hash) => (
                  <li key={hash} className="font-mono text-xs break-all text-foreground">
                    {hash}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Link
            to="/parcels"
            className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to all parcels
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
