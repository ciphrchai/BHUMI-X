import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-bold text-blue-900 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-900 mb-2">Page not found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for does not exist.
      </p>
      <Button variant="primary" size="lg" onClick={() => navigate('/overview')}>
        Return to Overview
      </Button>
    </div>
  );
}
