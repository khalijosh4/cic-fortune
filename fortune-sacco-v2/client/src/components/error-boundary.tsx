import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

export function ComponentErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-md border border-destructive/20 bg-destructive/10 text-destructive text-xs text-center space-y-1 min-w-[120px]">
      <div className="flex items-center space-x-1">
        <AlertCircle className="h-3 w-3" />
        <span className="font-semibold">Widget Error</span>
      </div>
      <p className="opacity-80 break-words max-w-[150px] truncate" title={error.message}>
        {error.message}
      </p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary} className="h-5 px-2 text-[10px] mt-1 border-destructive/30 hover:bg-destructive/20 hover:text-destructive">
        <RefreshCcw className="mr-1 h-2 w-2" />
        Retry
      </Button>
    </div>
  );
}

export function ComponentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ComponentErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
