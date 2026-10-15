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
import { selectAddress } from '@/features/wallet/walletSlice';
import { fetchParcelsThunk } from '@/features/land/landThunks';
import { addLandDocumentThunk, transferOwnershipThunk } from '@/features/land/landWriteThunks';
import { selectLandStatus, selectParcels } from '@/features/land/landSlice';
import { isAddress } from '@/lib/geo';
import { selectIsSubmitting } from '@/features/ui/uiSlice';

export default function MyParcelsPage() {
  const dispatch = useAppDispatch();
  const address = useAppSelector(selectAddress);
  const parcels = useAppSelector(selectParcels);
  const status = useAppSelector(selectLandStatus);
  const isSubmitting = useAppSelector(selectIsSubmitting);

  const [documents, setDocuments] = useState<Record<number, string>>({});
  const [recipients, setRecipients] = useState<Record<number, string>>({});

  useEffect(() => {
    dispatch(fetchParcelsThunk());
  }, [dispatch]);

  const owned = parcels.filter(
    (parcel) => address !== null && parcel.owner.toLowerCase() === address.toLowerCase(),
  );

  const attachDocument = (landId: number) => {
    const hash = (documents[landId] ?? '').trim();
    if (!hash) {
      toast.error('Enter the document hash first.');
      return;
    }
    dispatch(addLandDocumentThunk({ landId, ipfsHash: hash }));
    setDocuments((current) => ({ ...current, [landId]: '' }));
  };

  const transfer = (landId: number) => {
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
      <PageHeader eyebrow="Owner workspace" title="My parcels" />

      <div className="animate-rise space-y-6">
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

        {status === 'ready' && owned.length === 0 && (
          <Card className="p-6">
            <p className="text-sm font-medium text-foreground">
              This wallet owns no parcel on this chain.
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              Ownership is recorded by the contract when an admin registers a parcel or when the
              current owner transfers one. Nothing on this page can grant ownership to a wallet.
            </p>
            <Link
              to="/parcels"
              className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Browse the parcel index
            </Link>
          </Card>
        )}

        {status === 'ready' &&
          owned.map((parcel) => (
            <Card key={parcel.id} className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-semibold text-foreground">Parcel #{parcel.id}</h2>
                <StatusBadge status={parcel.status} />
                <span className="text-sm text-muted-foreground">{parcel.area.toString()} m²</span>
                <span className="text-sm text-muted-foreground">
                  {parcel.documentHashes.length === 0
                    ? 'no documents attached'
                    : `${parcel.documentHashes.length} document(s) attached`}
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
                  <Label htmlFor={`document-${parcel.id}`}>Document hash</Label>
                  <Input
                    id={`document-${parcel.id}`}
                    value={documents[parcel.id] ?? ''}
                    onChange={(event) =>
                      setDocuments((current) => ({ ...current, [parcel.id]: event.target.value }))
                    }
                    placeholder="Qm…"
                    className="h-10 bg-background/60 font-mono text-xs"
                  />
                </div>
                <Button
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => attachDocument(parcel.id)}
                >
                  Attach hash
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <div className="min-w-[260px] flex-1 space-y-1.5">
                  <Label htmlFor={`recipient-${parcel.id}`}>Transfer to</Label>
                  <Input
                    id={`recipient-${parcel.id}`}
                    value={recipients[parcel.id] ?? ''}
                    onChange={(event) =>
                      setRecipients((current) => ({ ...current, [parcel.id]: event.target.value }))
                    }
                    placeholder="0x…"
                    className="h-10 bg-background/60 font-mono text-xs"
                  />
                </div>
                <Button disabled={isSubmitting} onClick={() => transfer(parcel.id)}>
                  Transfer ownership
                </Button>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                A transfer appends the recipient to the chain of title and cannot be undone, so check
                the address before signing.
              </p>
            </Card>
          ))}
      </div>
    </AppLayout>
  );
}
