import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import AppLayout, { PageHeader } from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchParcelsThunk } from '@/features/land/landThunks';
import { transferOwnershipThunk } from '@/features/land/landWriteThunks';
import { selectLandStatus, selectParcels } from '@/features/land/landSlice';
import { isAddress } from '@/lib/geo';
import { selectIsSubmitting } from '@/features/ui/uiSlice';

export default function NotaryPage() {
  const dispatch = useAppDispatch();
  const parcels = useAppSelector(selectParcels);
  const status = useAppSelector(selectLandStatus);
  const isSubmitting = useAppSelector(selectIsSubmitting);
  const [recipients, setRecipients] = useState<Record<number, string>>({});

  useEffect(() => {
    dispatch(fetchParcelsThunk());
  }, [dispatch]);

  const confirm = (landId: number) => {
    const recipient = (recipients[landId] ?? '').trim();
    if (!isAddress(recipient)) {
      toast.error('Recipient must be a 0x address with 40 hexadecimal characters.');
      return;
    }
    dispatch(transferOwnershipThunk({ landId, newOwner: recipient }));
    setRecipients((current) => ({ ...current, [landId]: '' }));
  };

  return (
    <AppLayout>
      <PageHeader eyebrow="Notary workspace" title="Confirm a transfer" />

      <div className="animate-rise space-y-6">
        <Card className="p-6">
          <p className="max-w-prose text-sm text-muted-foreground">
            Your address is in the contract's notary registry, which lets you confirm a transfer
            without owning the parcel. The transfer is recorded against the parcel's chain of title
            and cannot be undone.
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
              No parcel is registered on this chain yet, so there is nothing to confirm.
            </p>
          </Card>
        )}

        {status === 'ready' &&
          parcels.map((parcel) => (
            <Card key={parcel.id} className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-semibold text-foreground">Parcel #{parcel.id}</h2>
                <StatusBadge status={parcel.status} />
                <span className="font-mono text-xs break-all text-muted-foreground">
                  {parcel.owner}
                </span>
                <Link
                  to={`/parcels/${parcel.id}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open full record
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <div className="min-w-[260px] flex-1 space-y-1.5">
                  <Label htmlFor={`notary-recipient-${parcel.id}`}>New owner</Label>
                  <Input
                    id={`notary-recipient-${parcel.id}`}
                    value={recipients[parcel.id] ?? ''}
                    onChange={(event) =>
                      setRecipients((current) => ({ ...current, [parcel.id]: event.target.value }))
                    }
                    placeholder="0x…"
                    className="h-10 bg-background/60 font-mono text-xs"
                  />
                </div>
                <Button
                  disabled={isSubmitting || parcel.status === 'DIBATALKAN'}
                  onClick={() => confirm(parcel.id)}
                >
                  Confirm transfer
                </Button>
              </div>

              {parcel.status === 'DIBATALKAN' && (
                <p className="mt-3 text-xs text-muted-foreground">
                  This registration is revoked, so the contract refuses further transfers.
                </p>
              )}
            </Card>
          ))}
      </div>
    </AppLayout>
  );
}
