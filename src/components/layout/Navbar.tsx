import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/overview', label: 'Overview' },
    { to: '/explorer', label: 'Explorer' },
    { to: '/analysis', label: 'Analysis' },
    { to: '/results', label: 'Results' },
    { to: '/simulator', label: 'Simulator' },
    { to: '/reports', label: 'Reports' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center text-[#1a2332]">
          <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
            <rect width="28" height="28" rx="5" fill="#1a2332"/>
            <path d="M5 20L14 7L23 20H5Z" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M9 20L14 12L19 20H9Z" fill="#3b82f6" opacity="0.3"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none tracking-tight text-[#1a2332]">BHUMI-X</span>
          <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Government Land Intelligence</span>
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

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <User className="w-5 h-5" />
        </button>
        <button 
          className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
        </div>
      )}
    </nav>
  );
}
