import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Menu, X, LogOut, Settings, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('bhumiX_logged_in') === 'true'
  );

  const navigate = useNavigate();

  const navLinks = [
    { to: '/overview', label: 'Overview' },
    { to: '/explorer', label: 'Explorer' },
    { to: '/analysis', label: 'Analysis' },
    { to: '/results', label: 'Results' },
    { to: '/simulator', label: 'Simulator' },
    { to: '/reports', label: 'Reports' },
  ];

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(
        localStorage.getItem('bhumiX_logged_in') === 'true'
      );
    };

    window.addEventListener('storage', checkLogin);

    return () => {
      window.removeEventListener('storage', checkLogin);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bhumiX_logged_in');
    localStorage.removeItem('bhumiX_user');

    setIsLoggedIn(false);
    setProfileOpen(false);

    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 sm:px-6">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center text-[#1a2332]">
          <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
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

        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none tracking-tight text-[#1a2332]">
            BHUMI-X
          </span>

          <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
            Government Land Intelligence
          </span>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center h-full space-x-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center h-full px-4 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-[#3b82f6] text-[#2563eb]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 relative">

        {/* Profile / Login */}
        {isLoggedIn ? (
          <div className="relative">

            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Open profile"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>

              <div className="hidden lg:flex flex-col text-left leading-tight">
                <span className="text-sm font-medium text-gray-900">
                  Chaitanya Thakur
                </span>

                <span className="text-[10px] text-gray-500">
                  Land Intelligence Analyst
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-12 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-[60]">

                {/* Profile Header */}
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        Chaitanya Thakur
                      </p>

                      <p className="text-xs text-gray-500">
                        Land Intelligence Analyst
                      </p>
                    </div>

                  </div>
                </div>

                {/* Profile Details */}
                <div className="px-5 py-4 space-y-3">

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Role
                    </span>

                    <span className="text-xs font-medium text-gray-800">
                      Planning Analyst
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Joined
                    </span>

                    <span className="text-xs font-medium text-gray-800">
                      2026
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Access
                    </span>

                    <span className="text-xs font-medium text-green-600">
                      Standard
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Platform
                    </span>

                    <span className="text-xs font-medium text-gray-800">
                      BHUMI-X
                    </span>
                  </div>

                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 py-1">

                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>

                </div>

              </div>
            )}

          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            title="Login"
            aria-label="Login"
            className="p-2 rounded-full hover:bg-blue-50 hover:text-[#2563eb] text-gray-600 transition-colors"
          >
            <User className="w-5 h-5" />
          </button>
        )}

        {/* Mobile Menu */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg py-2">

          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm font-medium ${
                  isActive
                    ? 'text-[#2563eb] bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {!isLoggedIn && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Login
            </button>
          )}

          {isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          )}

        </div>
      )}
    </nav>
  );
}