import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectRole, selectUsername } from '@/features/wallet/walletSlice';
import { disconnectWalletThunk } from '@/features/wallet/walletThunks';
import { hasAnyRole, ADMIN_ROLES } from '@/utils/role';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

// Add / remove nav items here as your app grows.
const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
];

// ─── Brand ───────────────────────────────────────────────────────────────────
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* Logo mark — swap this with your logo SVG or an <img /> */}
      <div className="relative flex size-8 shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" />
        <div className="relative grid size-8 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
          <div className="size-3 rounded-sm bg-primary" />
        </div>
      </div>
      {!compact && (
        <span className="font-semibold tracking-tight text-foreground">Land Registry</span>
      )}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <header className="animate-rise flex flex-wrap items-end justify-between gap-4 pb-8">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif italic text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────
export default function AppLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const username = useAppSelector(selectUsername);
  const role = useAppSelector(selectRole);
  const isAdmin = hasAnyRole(role, ADMIN_ROLES);
  const items = NAV.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-border bg-card">

        {/* Brand */}
        <div className="flex h-[58px] shrink-0 items-center px-4 border-b border-border">
          <NavLink to="/dashboard">
            <Brand />
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex size-7 items-center justify-center rounded-md transition-colors duration-150',
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <Separator />

        {/* User chip */}
        <div className="px-2 py-3">
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            {/* Avatar */}
            <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary ring-1 ring-primary/20">
              {(username ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{username}</p>
              <Badge variant="secondary" className="mt-0.5 text-[10px] px-1.5 py-0 h-4 rounded-sm">
                {role}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => dispatch(disconnectWalletThunk())}
              className="shrink-0 text-muted-foreground hover:text-destructive"
              aria-label="Log out"
            >
              <LogOut size={14} />
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Right column (mobile top bar + main content) ─────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <NavLink to="/dashboard" className="shrink-0">
            <Brand compact />
          </NavLink>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => dispatch(disconnectWalletThunk())}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Log out"
          >
            <LogOut size={15} />
          </Button>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
