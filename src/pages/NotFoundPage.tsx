import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">

      {/* Background number */}
      <p
        className="animate-fade pointer-events-none select-none font-serif text-[clamp(8rem,22vw,16rem)] font-normal leading-none text-foreground/[0.04]"
        style={{ animationDuration: '1s' }}
      >
        404
      </p>

      {/* Content sits over the big number */}
      <div className="animate-rise absolute flex flex-col items-center gap-4" style={{ animationDelay: '60ms' }}>
        <h1 className="font-serif italic text-3xl font-normal text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
          The route you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild variant="outline" className="mt-2 gap-2">
          <Link to="/">
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
