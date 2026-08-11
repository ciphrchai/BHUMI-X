import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = 'Something went wrong', 
  message = 'An error occurred while loading the data.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px] w-full bg-red-50 rounded-lg border border-red-100">
      <div className="text-red-500 mb-3">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-semibold text-red-800 mb-1">{title}</h3>
      <p className="text-sm text-red-600 mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
