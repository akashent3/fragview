'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User, ShoppingBag, Sparkles } from 'lucide-react';

import ThemeToggle from '@/components/ui/ThemeToggle';
import TopbarActions from '@/components/layout/TopbarActions';
import SearchAutocomplete from '@/components/common/SearchAutocomplete';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2 flex-shrink-0">
            <div className="relative">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-2 text-xl font-bold text-white transition-shadow group-hover:shadow-lg">
                <span className="relative z-10 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  FragView
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 group-hover:animate-pulse" />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center space-x-8 md:flex flex-shrink-0">
            <Link href="/" className="text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Home
            </Link>
            <Link href="/brands" className="text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Brands
            </Link>
            <Link href="/perfumes" className="text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Perfumes
            </Link>
            <Link href="/discover" className="text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Discover
            </Link>
            <Link href="/search" className="text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Search
            </Link>
          </div>

          {/* Desktop Search with Autocomplete - ENHANCED */}
          <div className="hidden w-full max-w-md flex-1 md:flex">
            <SearchAutocomplete placeholder="Search fragrances, brands..." />
          </div>

          {/* Right Side Actions */}
          <div className="hidden items-center space-x-4 md:flex flex-shrink-0">
            <ThemeToggle />
            <Link
              href="/wardrobe"
              className="text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              aria-label="Wardrobe"
            >
              <ShoppingBag className="h-5 w-5" />
            </Link>
            <Link
              href="/profile"
              className="text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Link>
            <TopbarActions />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {isOpen && (
          <div className="md:hidden">
            <div className="space-y-1 border-t border-gray-200 bg-white px-2 pb-3 pt-2 transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900">
              {/* Mobile Search with Autocomplete */}
              <div className="px-3 py-2">
                <SearchAutocomplete placeholder="Search..." />
              </div>
              <Link href="/" className="block px-3 py-2 text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                Home
              </Link>
              <Link href="/brands" className="block px-3 py-2 text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                Brands
              </Link>
              <Link href="/perfumes" className="block px-3 py-2 text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                Perfumes
              </Link>
              <Link href="/discover" className="block px-3 py-2 text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                Discover
              </Link>
              <Link href="/search" className="block px-3 py-2 text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                Search
              </Link>
              <Link href="/wardrobe" className="block px-3 py-2 text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                My Wardrobe
              </Link>
              <Link href="/profile" className="block px-3 py-2 text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                Profile
              </Link>
              <div className="px-3 py-2">
                <Link
                  href="/signin"
                  className="block w-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-2 text-center text-white"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;