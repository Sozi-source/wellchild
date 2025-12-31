// app/components/layout/Navigation.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { useAuth } from '@/app/context/AuthContext';


export default function Navigation() {
  const { userProfile, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleNavigation = () => {
    if (!userProfile) return [];

    switch (userProfile.role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/dashboard/admin', icon: '🏠' },
          { name: 'Clinicians', href: '/dashboard/clinicians', icon: '👨‍⚕️' },
          { name: 'Guardians', href: '/dashboard/guardians/', icon: '👥' },
          { name: 'Reports', href: '/reports', icon: '📊' },
        ];
      case 'clinician':
        return [
          { name: 'Dashboard', href: '/dashboard/clinician', icon: '🏠' },
          { name: 'My Children', href: '/dashboard/children', icon: '👶' },
          { name: 'Appointments', href: '/dashboard/appointments', icon: '📅' },
          { name: 'Growth Charts', href: '/dashboard/growth', icon: '📈' },
        ];
      case 'guardian':
        return [
          { name: 'Dashboard', href: '/dashboard/guardian/', icon: '🏠' },
          { name: 'My Children', href: '/dashboard/guardian/children', icon: '👶' },
          { name: 'Appointments', href: '/dashboard/guardian/appointments', icon: '📅' },
          { name: 'Alerts', href: '/dashboard/guardian/alerts', icon: '🔔' },
        ];
      default:
        return [];
    }
  };

  const navigation = getRoleNavigation();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!userProfile) {
    return null;
  }

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">👶</span>
              <span className="font-bold text-xl text-gray-900">Well-child</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-sm text-right">
                <p className="font-medium text-gray-900">{userProfile.name}</p>
                <p className="text-gray-500 capitalize">{userProfile.role}</p>
              </div>
              {userProfile.profilePicture ? (
                <img
                  src={userProfile.profilePicture}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {userProfile.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
            >
              Logout
            </Button>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 text-sm font-medium py-2 ${
                    pathname.startsWith(item.href)
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-3 py-2">
                  {userProfile.profilePicture ? (
                    <img
                      src={userProfile.profilePicture}
                      alt={userProfile.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {userProfile.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{userProfile.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{userProfile.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}