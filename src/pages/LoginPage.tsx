import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Wallet } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { connectWalletThunk } from '@/features/wallet/walletThunks';
import { selectIsAuthenticated } from '@/features/wallet/walletSlice';
import { selectIsSubmitting } from '@/features/ui/uiSlice';
import { Button } from '@/components/ui/button';
import { Brand } from '@/components/AppLayout';

export default function ConnectWalletPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isConnected = useAppSelector(selectIsAuthenticated);
  const isSubmitting = useAppSelector(selectIsSubmitting);

  useEffect(() => {
    if (isConnected) navigate('/dashboard', { replace: true });
  }, [isConnected, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-64 w-96 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, oklch(0.78 0.145 192 / 0.35) 0%, transparent 70%)',
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.78 0.145 192) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.145 192) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div
        className="animate-rise relative z-10 w-full max-w-[380px]"
        style={{ animationDuration: '0.7s' }}
      >
        <div
          className="absolute -inset-px rounded-2xl opacity-40"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.78 0.145 192 / 0.3) 0%, transparent 50%, oklch(0.78 0.145 192 / 0.1) 100%)',
          }}
        />

        <div className="relative rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-black/40">
          <div className="mb-7 flex justify-center">
            <Brand />
          </div>

          <div className="animate-rise mb-7 text-center" style={{ animationDelay: '80ms' }}>
            <h1 className="font-serif italic text-3xl font-normal text-foreground">
              Connect your wallet
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Signing in happens in your wallet, not on a server.
            </p>
          </div>

          <Button
            size="lg"
            className="animate-rise w-full gap-2 font-medium"
            style={{ animationDelay: '140ms' }}
            disabled={isSubmitting}
            onClick={() => dispatch(connectWalletThunk())}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Waiting for wallet…
              </>
            ) : (
              <>
                <Wallet size={16} />
                Connect wallet
              </>
            )}
          </Button>

          <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
            For the demo, run the local Hardhat node and add chain 31337 to MetaMask first.
          </p>
        </div>
      </div>
    </div>
  );
}
