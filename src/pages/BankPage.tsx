import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import AppLayout, { PageHeader } from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchParcelThunk } from '@/features/land/landThunks';
import { selectLandError, selectLandStatus, selectSelectedParcel } from '@/features/land/landSlice';
import { selectIsFetching } from '@/features/ui/uiSlice';

export default function BankPage() {
  const dispatch = useAppDispatch();
  const parcel = useAppSelector(selectSelectedParcel);
  const status = useAppSelector(selectLandStatus);
  const error = useAppSelector(selectLandError);
  const isFetching = useAppSelector(selectIsFetching);
  const [lookup, setLookup] = useState('');

  const submit = () => {
    const landId = Number(lookup);
    if (!Number.isInteger(landId) || landId <= 0) {
      toast.error('Enter the parcel number you want to verify.');
      return;
    }
    dispatch(fetchParcelThunk(landId));
  };

  const registered = status === 'ready' && parcel !== null;

  return (
    <AppLayout>
      <PageHeader eyebrow="Financing workspace" title="Verify a parcel" />

      <div className="animate-rise space-y-6">
        <Card className="p-6">
          <p className="max-w-prose text-sm text-muted-foreground">
            Check whether a parcel is registered, who owns it, and whether its status blocks a
            transaction. This is a verification aid over the public record, not a title certificate.
          </p>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1 space-y-1.5">
              <Label htmlFor="lookup">Parcel number</Label>
              <Input
                id="lookup"
                inputMode="numeric"
                value={lookup}
                onChange={(event) => setLookup(event.target.value)}
                placeholder="1"
                className="h-10 bg-background/60"
              />
            </div>
            <Button onClick={submit} disabled={isFetching}>
              {isFetching ? 'Reading…' : 'Verify parcel'}
            </Button>
          </div>
        </Card>

        {status === 'not-registered' && (
          <Card className="p-6">
            <p className="text-sm font-medium text-foreground">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing is registered under that number, so there is no title to verify here.
            </p>
          </Card>
        )}

        {status === 'error' && (
          <Card className="border-destructive/40 p-6">
            <p className="text-sm font-medium text-foreground">The chain did not answer.</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={submit}>
              Try again
            </Button>
          </Card>
        )}

        {registered && (
          <Card className="p-6">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Owner on record</dt>
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
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Disputed</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {parcel.status === 'SENGKETA' ? 'Yes, do not proceed without checking the record' : 'No dispute recorded'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Documents</dt>
                <dd className="mt-1 text-sm text-foreground">{parcel.documentHashes.length}</dd>
              </div>
            </dl>
            <Link
              to={`/parcels/${parcel.id}`}
              className="mt-5 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Open the full record and chain of title
            </Link>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
