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
        <div className="flex h-16 items-center gap-4">
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

          {/* Desktop Navigation Links - WITH TOOLTIPS */}
          <div className="hidden items-center space-x-6 lg:flex flex-shrink-0">
            <div className="relative group">
              <Link 
                href="/" 
                className="text-sm font-medium text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 whitespace-nowrap"
              >
                Home
              </Link>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none">
                Home Page
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
              </div>
            </div>

            <div className="relative group">
              <Link 
                href="/brands" 
                className="text-sm font-medium text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 whitespace-nowrap"
              >
                Brands
              </Link>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none">
                Explore Brands
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
              </div>
            </div>

            <div className="relative group">
              <Link 
                href="/perfumes" 
                className="text-sm font-medium text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 whitespace-nowrap"
              >
                Perfumes
              </Link>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none">
                Explore Perfumes
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
              </div>
            </div>

            <div className="relative group">
              <Link 
                href="/search" 
                className="text-sm font-medium text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 whitespace-nowrap"
              >
                Search
              </Link>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none">
                Advanced Search
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
              </div>
            </div>
          </div>

          {/* Desktop Search - EXPANDS TO FILL SPACE */}
          <div className="hidden lg:flex flex-1 min-w-0 px-4">
            <div className="w-full">
              <SearchAutocomplete placeholder="Search fragrances, brands, notes..." />
            </div>
          </div>

          {/* Right Section: Actions - FIXED ALIGNMENT & HOVER */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {/* Theme Toggle with Tooltip - FIXED */}
            <div className="relative group flex items-center">
              <div className="flex items-center justify-center">
                <ThemeToggle />
              </div>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                Light/Dark Theme Toggle
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
              </div>
            </div>

            {/* Wardrobe with Tooltip - FIXED */}
            <div className="relative group flex items-center">
              <Link
                href="/wardrobe"
                className="flex items-center justify-center text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                aria-label="Wardrobe"
              >
                <ShoppingBag className="h-5 w-5" />
              </Link>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                Virtual Wardrobe
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
              </div>
            </div>

            {/* Profile with Tooltip - FIXED */}
            <div className="relative group flex items-center">
              <Link
                href="/profile"
                className="flex items-center justify-center text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Link>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                Profile
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
              </div>
            </div>

            <TopbarActions />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 lg:hidden ml-auto">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="text-gray-700 transition-colors duration-300 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 border-t border-gray-200 bg-white px-2 pb-3 pt-2 transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900">
              {/* Mobile Search with Autocomplete */}
              <div className="px-3 py-2">
                <SearchAutocomplete placeholder="Search..." />
              </div>
              <Link 
                href="/" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/brands" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                onClick={() => setIsOpen(false)}
              >
                Brands
              </Link>
              <Link 
                href="/perfumes" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                onClick={() => setIsOpen(false)}
              >
                Perfumes
              </Link>
              <Link 
                href="/search" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                onClick={() => setIsOpen(false)}
              >
                Advanced Search
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <Link 
                href="/wardrobe" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                onClick={() => setIsOpen(false)}
              >
                My Wardrobe
              </Link>
              <Link 
                href="/profile" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                onClick={() => setIsOpen(false)}
              >
                My Profile
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <div className="px-3 py-2">
                <TopbarActions />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;