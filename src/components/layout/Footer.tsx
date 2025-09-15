import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Facebook, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand - FIXED */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-3 py-2 rounded-lg font-bold text-xl inline-flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              FragView
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Discover, review, and explore the world of fragrances with our modern platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Explore - FIXED */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/brands" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  Brand Directory
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  Discover
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  Advanced Search
                </Link>
              </li>
              <li>
                <Link href="/trending" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  Trending
                </Link>
              </li>
            </ul>
          </div>

          {/* Account - FIXED */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/wardrobe" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  My Wardrobe
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  My Reviews
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support - FIXED */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            © 2024 FragView. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;