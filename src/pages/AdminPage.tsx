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
import {
  registerLandThunk,
  registerNotaryThunk,
  revokeLandRegistrationThunk,
  updateLandAreaThunk,
  updateLandStatusThunk,
} from '@/features/land/landWriteThunks';
import { selectLandStatus, selectParcels } from '@/features/land/landSlice';
import { countVertices, isAddress, isPositiveNumber, toScaledCoordinates } from '@/lib/geo';
import { selectIsSubmitting } from '@/features/ui/uiSlice';

const STATUS_OPTIONS = [
  { value: '0', label: 'AKTIF' },
  { value: '1', label: 'SENGKETA' },
  { value: '2', label: 'DIBATALKAN' },
];

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const parcels = useAppSelector(selectParcels);
  const status = useAppSelector(selectLandStatus);
  const isSubmitting = useAppSelector(selectIsSubmitting);

  const [coordinates, setCoordinates] = useState('');
  const [area, setArea] = useState('');
  const [owner, setOwner] = useState('');
  const [notary, setNotary] = useState('');
  const [managedId, setManagedId] = useState('');
  const [managedArea, setManagedArea] = useState('');
  const [managedStatus, setManagedStatus] = useState('0');

  useEffect(() => {
    dispatch(fetchParcelsThunk());
  }, [dispatch]);

  const managed = parcels.find((parcel) => String(parcel.id) === managedId) ?? null;

  const submitParcel = () => {
    if (countVertices(coordinates) < 3) {
      toast.error('Enter at least three coordinate pairs, separated by semicolons.');
      return;
    }
    if (!isPositiveNumber(area)) {
      toast.error('Area must be a positive number of square metres.');
      return;
    }
    if (!isAddress(owner)) {
      toast.error('Owner must be a 0x address with 40 hexadecimal characters.');
      return;
    }
    dispatch(
      registerLandThunk({
        coordinates: toScaledCoordinates(coordinates),
        area: Number(area),
        owner: owner.trim(),
      }),
    );
  };

  const submitNotary = () => {
    if (!isAddress(notary)) {
      toast.error('Notary must be a 0x address with 40 hexadecimal characters.');
      return;
    }
    dispatch(registerNotaryThunk({ notary: notary.trim() }));
  };

  const submitArea = () => {
    if (!managed) return;
    if (!isPositiveNumber(managedArea)) {
      toast.error('Area must be a positive number of square metres.');
      return;
    }
    dispatch(updateLandAreaThunk({ landId: managed.id, newArea: Number(managedArea) }));
  };

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Administration"
        title="Registry admin"
        actions={
          <span className="text-xs text-muted-foreground">
            Every action below is signed by your wallet
          </span>
        }
      />

      <div className="animate-rise space-y-6">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground">Register a parcel</h2>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Coordinates in decimal degrees, pairs separated by semicolons, at least three points. The
            contract converts the boundary to scaled integers and rejects a parcel that overlaps a
            registered one.
          </p>
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="coordinates">Boundary</Label>
              <textarea
                id="coordinates"
                rows={3}
                value={coordinates}
                onChange={(event) => setCoordinates(event.target.value)}
                placeholder="-6.9147,106.9098;-6.9147,106.9108;-6.9157,106.9108"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs text-foreground shadow-sm placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="area">Area in square metres</Label>
                <Input
                  id="area"
                  inputMode="numeric"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="250"
                  className="h-10 bg-background/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="owner">Owner address</Label>
                <Input
                  id="owner"
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                  placeholder="0x…"
                  className="h-10 bg-background/60 font-mono text-xs"
                />
              </div>
            </div>
            <Button onClick={submitParcel} disabled={isSubmitting}>
              Register parcel
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground">Register a notary</h2>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            A registered notary can confirm an ownership transfer without owning the parcel.
          </p>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1 space-y-1.5">
              <Label htmlFor="notary">Notary address</Label>
              <Input
                id="notary"
                value={notary}
                onChange={(event) => setNotary(event.target.value)}
                placeholder="0x…"
                className="h-10 bg-background/60 font-mono text-xs"
              />
            </div>
            <Button variant="outline" onClick={submitNotary} disabled={isSubmitting}>
              Register notary
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground">Manage a registered parcel</h2>
          {status === 'error' && (
            <div className="mt-2">
              <p className="text-sm font-medium text-foreground">The chain did not answer.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Registration and revisions need the node running. Start it, then read again.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => dispatch(fetchParcelsThunk())}
              >
                Read again
              </Button>
            </div>
          )}
          {(status === 'idle' || status === 'loading') && (
            <p role="status" className="mt-2 text-sm text-muted-foreground">
              Reading parcels from the chain…
            </p>
          )}
          {status === 'ready' && parcels.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              No parcel is registered on this chain yet.
            </p>
          )}
          {status === 'ready' && parcels.length > 0 && (
            <>
              <div className="mt-5 space-y-1.5">
                <Label htmlFor="managed">Parcel</Label>
                <select
                  id="managed"
                  value={managedId}
                  onChange={(event) => setManagedId(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a parcel</option>
                  {parcels.map((parcel) => (
                    <option key={parcel.id} value={parcel.id}>
                      #{parcel.id}, {parcel.area.toString()} m², {parcel.status}
                    </option>
                  ))}
                </select>
              </div>

              {!managed && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Pick a parcel to revise its area, move it into dispute, or revoke the registration.
                </p>
              )}

              {managed && (
                <div className="mt-5 space-y-5">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <StatusBadge status={managed.status} />
                    <span>{managed.area.toString()} m²</span>
                    <span className="font-mono text-xs break-all">{managed.owner}</span>
                    <Link
                      to={`/parcels/${managed.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Open full record
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[200px] flex-1 space-y-1.5">
                      <Label htmlFor="managed-area">Revised area in square metres</Label>
                      <Input
                        id="managed-area"
                        inputMode="numeric"
                        value={managedArea}
                        onChange={(event) => setManagedArea(event.target.value)}
                        placeholder={managed.area.toString()}
                        className="h-10 bg-background/60"
                      />
                    </div>
                    <Button variant="outline" onClick={submitArea} disabled={isSubmitting}>
                      Save area
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[200px] flex-1 space-y-1.5">
                      <Label htmlFor="managed-status">Status</Label>
                      <select
                        id="managed-status"
                        value={managedStatus}
                        onChange={(event) => setManagedStatus(event.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() =>
                        dispatch(
                          updateLandStatusThunk({
                            landId: managed.id,
                            status: Number(managedStatus),
                          }),
                        )
                      }
                    >
                      Set status
                    </Button>
                  </div>

                  <div className="border-t border-border pt-5">
                    <p className="text-sm text-muted-foreground">
                      Revoking keeps the parcel and its chain of title on chain, and blocks further
                      transfers.
                    </p>
                    <Button
                      variant="destructive"
                      className="mt-3"
                      disabled={isSubmitting || managed.status === 'DIBATALKAN'}
                      onClick={() =>
                        dispatch(revokeLandRegistrationThunk({ landId: managed.id }))
                      }
                    >
                      Revoke registration
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        <Link
          to="/parcels"
          className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to the public index
        </Link>
      </div>
    </AppLayout>
  );
}
