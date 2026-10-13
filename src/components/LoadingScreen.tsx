import { Loader2 } from 'lucide-react';
import { Brand } from './AppLayout';

/** Full-screen skeleton shown while the session bootstraps. */
export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="animate-fade">
        <Brand />
      </div>
      <Loader2
        size={20}
        className="animate-spin text-primary/60"
        style={{ animationDuration: '1.2s' }}
      />
    </div>
  );
}
