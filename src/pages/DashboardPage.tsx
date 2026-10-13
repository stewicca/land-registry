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
          <dd className="font-mono break-all text-foreground">{address ?? '—'}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd className="text-foreground">{role ?? '—'}</dd>
        </dl>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Parcel pages, the chain-of-title view, and the role-based workspaces land in phase 3
          and phase 4. Contract and its test suite come first.
        </p>
      </div>
    </AppLayout>
  );
}
