import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    // Prototype authentication
    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }

    // Prototype login — real authentication will be connected to backend later
    localStorage.setItem('bhumiX_logged_in', 'true');
    localStorage.setItem('bhumiX_user', username);

    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg
              viewBox="0 0 28 28"
              fill="none"
              className="w-14 h-14"
            >
              <rect
                width="28"
                height="28"
                rx="5"
                fill="#1a2332"
              />

              <path
                d="M5 20L14 7L23 20H5Z"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              <path
                d="M9 20L14 12L19 20H9Z"
                fill="#3b82f6"
                opacity="0.3"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#1a2332]">
            BHUMI-X
          </h1>

          <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-1">
            Government Land Intelligence
          </p>
        </div>

        <Card className="p-8">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Sign in
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Access the BHUMI-X planning platform.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full h-11 pl-10 pr-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-10 pr-10 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Login */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
            >
              Sign In
            </Button>

          </form>

          <div className="mt-6 pt-5 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              Prototype authentication
            </p>
          </div>

        </Card>

        <button
          type="button"
          onClick={() => navigate('/overview')}
          className="w-full mt-4 text-sm text-gray-500 hover:text-blue-600"
        >
          Continue without signing in
        </button>

      </div>
    </div>
  );
}