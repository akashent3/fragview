import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Facebook, Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-transparent to-green-50/30 border-t border-green-100/50 mt-8 transition-all duration-300 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
      {/* Decorative element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Leaf className="text-green-400/20 w-8 h-8" />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6 md:gap-8 lg:gap-12 md:justify-items-center">
        {/* Brand */}
        <div className="space-y-3 flex flex-col items-start md:items-center">
          <img 
            src="/logo.svg" 
            alt="FragView Logo" 
            className="h-14 w-auto"
          />
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm text-left md:text-center">
            Discover, review, and explore the world of fragrances.
          </p>
          <div className="flex space-x-3 md:justify-center">
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <Instagram className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <Twitter className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <Facebook className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          </div>
        </div>  
          {/* Explore */}
          <div className="md:text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300 text-sm md:text-base">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/brands" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-xs md:text-sm transition-colors">
                  Brand Directory
                </Link>
              </li>
              <li>
                <Link href="/perfumes" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-xs md:text-sm transition-colors">
                  Perfumes
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-xs md:text-sm transition-colors">
                  Advanced Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="md:text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300 text-sm md:text-base">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/profile" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-xs md:text-sm transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/wardrobe" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-xs md:text-sm transition-colors">
                  My Wardrobe
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-xs md:text-sm transition-colors">
                  My Reviews
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-xs md:text-sm transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-100 dark:border-gray-700 mt-6 pt-6 text-center transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">
            © 2024 FragView. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;