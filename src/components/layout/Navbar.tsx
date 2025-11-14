'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User, ShoppingBag, Sparkles } from 'lucide-react';

import TopbarActions from '@/components/layout/TopbarActions';
import SearchAutocomplete from '@/components/common/SearchAutocomplete';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-green-100/50 bg-white/80 backdrop-blur-lg transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo with Botanical Theme */}
          <Link href="/" className="group flex items-center space-x-2 flex-shrink-0">
            <div className="relative">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-orange-500 px-4 py-2 text-xl font-bold text-white transition-all group-hover:shadow-lg group-hover:scale-105">
                <span className="relative z-10 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  FragView
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center space-x-6 lg:flex flex-shrink-0">
            <div className="relative group">
              <Link 
                href="/" 
                className="text-sm font-medium text-gray-700 transition-all duration-300 hover:text-green-600 whitespace-nowrap"
              >
                Home
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                Home Page
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>

            <div className="relative group">
              <Link 
                href="/brands" 
                className="text-sm font-medium text-gray-700 transition-all duration-300 hover:text-green-600 whitespace-nowrap"
              >
                Brands
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                Explore Brands
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>

            <div className="relative group">
              <Link 
                href="/perfumes" 
                className="text-sm font-medium text-gray-700 transition-all duration-300 hover:text-green-600 whitespace-nowrap"
              >
                Perfumes
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                Explore Perfumes
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>

            <div className="relative group">
              <Link 
                href="/search" 
                className="text-sm font-medium text-gray-700 transition-all duration-300 hover:text-green-600 whitespace-nowrap"
              >
                Search
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                Advanced Search
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 min-w-0 px-4">
            <div className="w-full">
              <SearchAutocomplete placeholder="Search fragrances, brands, notes..." />
            </div>
          </div>

          {/* Right Section: Actions - REMOVED THEME TOGGLE */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <div className="relative group flex items-center">
              <Link
                href="/wardrobe"
                className="flex items-center justify-center text-gray-700 transition-all duration-300 hover:text-green-600 p-2"
                aria-label="Wardrobe"
              >
                <ShoppingBag className="h-5 w-5" />
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                Virtual Wardrobe
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>

            <div className="relative group flex items-center">
              <Link
                href="/profile"
                className="flex items-center justify-center text-gray-700 transition-all duration-300 hover:text-green-600 p-2"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                Profile
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>

            <TopbarActions />
          </div>

          {/* Mobile menu button - REMOVED THEME TOGGLE */}
          <div className="flex items-center lg:hidden ml-auto">
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="text-gray-700 transition-all duration-300 hover:text-green-600 p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 border-t border-green-100 bg-white/95 backdrop-blur-md px-2 pb-3 pt-2 transition-all duration-300">
              <div className="px-3 py-2">
                <SearchAutocomplete placeholder="Search..." />
              </div>
              <Link 
                href="/" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all duration-300 hover:bg-green-50 hover:text-green-600"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/brands" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all duration-300 hover:bg-green-50 hover:text-green-600"
                onClick={() => setIsOpen(false)}
              >
                Brands
              </Link>
              <Link 
                href="/perfumes" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all duration-300 hover:bg-green-50 hover:text-green-600"
                onClick={() => setIsOpen(false)}
              >
                Perfumes
              </Link>
              <Link 
                href="/search" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all duration-300 hover:bg-green-50 hover:text-green-600"
                onClick={() => setIsOpen(false)}
              >
                Advanced Search
              </Link>
              <div className="border-t border-green-100 my-2"></div>
              <Link 
                href="/wardrobe" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all duration-300 hover:bg-green-50 hover:text-green-600"
                onClick={() => setIsOpen(false)}
              >
                My Wardrobe
              </Link>
              <Link 
                href="/profile" 
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all duration-300 hover:bg-green-50 hover:text-green-600"
                onClick={() => setIsOpen(false)}
              >
                My Profile
              </Link>
              <div className="border-t border-green-100 my-2"></div>
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