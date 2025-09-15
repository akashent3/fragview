'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User, ShoppingBag, Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* FragView Logo - FIXED */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2 rounded-xl font-bold text-xl relative overflow-hidden group-hover:shadow-lg transition-shadow">
                <span className="relative z-10 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  FragView
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 group-hover:animate-pulse"></div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - FIXED */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
              Home
            </Link>
            <Link href="/brands" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
              Brands
            </Link>
            <Link href="/discover" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
              Discover
            </Link>
            <Link href="/search" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
              Search
            </Link>
          </div>

          {/* Search Bar - FIXED */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search fragrances, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
              />
            </div>
          </div>

          {/* User Actions - FIXED */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/wardrobe" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
              <ShoppingBag className="w-5 h-5" />
            </Link>
            <Link href="/profile" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
              <User className="w-5 h-5" />
            </Link>
            <button className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-shadow">
              Sign In
            </button>
          </div>

          {/* Mobile menu button - FIXED */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - FIXED */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                  />
                </div>
              </div>
              <Link href="/" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
                Home
              </Link>
              <Link href="/brands" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
                Brands
              </Link>
              <Link href="/discover" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
                Discover
              </Link>
              <Link href="/search" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
                Search
              </Link>
              <Link href="/wardrobe" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
                My Wardrobe
              </Link>
              <Link href="/profile" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
                Profile
              </Link>
              <div className="px-3 py-2">
                <button className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2 rounded-full">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;