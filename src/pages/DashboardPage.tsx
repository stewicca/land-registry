import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAddress, selectRole } from '@/features/wallet/walletSlice';
import AppLayout, { PageHeader } from '@/components/AppLayout';

export default function DashboardPage() {
  const address = useAppSelector(selectAddress);
  const role = useAppSelector(selectRole);

  return (
    <AppLayout>
      <PageHeader eyebrow="Session" title="Wallet connected." />

      <div className="animate-rise space-y-4" style={{ animationDelay: '90ms' }}>
        <dl className="grid gap-3 text-sm sm:grid-cols-[140px_1fr]">
          <dt className="text-muted-foreground">Account</dt>
          <dd className="font-mono break-all text-foreground">{address ?? 'not connected'}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd className="text-foreground">{role ?? 'no role'}</dd>
        </dl>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          The role above comes from the contract: the admin address, the notary registry, and who owns
          which parcel. Registration and transfer workspaces arrive in phase 4.
        </p>
        <Link
          to="/parcels"
          className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Browse the parcel index
        </Link>
      </div>
    </AppLayout>
  );
}
