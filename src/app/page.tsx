import React from 'react';
import Link from 'next/link';
import { Star, Trending, Users, Award, Sparkles } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';

const HomePage = () => {
  // Mock data
  const featuredPerfumes = [
    {
      id: 1,
      name: 'Sauvage',
      brand: 'Dior',
      image: '/api/placeholder/300/400',
      rating: 4.3,
      reviews: 1247,
      accords: [
        { name: 'fresh' },
        { name: 'spicy' },
        { name: 'woody' }
      ]
    },
    {
      id: 2,
      name: 'Black Opium',
      brand: 'Yves Saint Laurent',
      image: '/api/placeholder/300/400',
      rating: 4.5,
      reviews: 892,
      accords: [
        { name: 'oriental' },
        { name: 'gourmand' },
        { name: 'sweet' }
      ]
    },
    {
      id: 3,
      name: 'Tom Ford Oud Wood',
      brand: 'Tom Ford',
      image: '/api/placeholder/300/400',
      rating: 4.7,
      reviews: 634,
      accords: [
        { name: 'woody' },
        { name: 'oriental' },
        { name: 'smoky' }
      ]
    }
  ];

  const trendingBrands = [
    { name: 'Dior', fragrances: 45, image: '/api/placeholder/100/100' },
    { name: 'Chanel', fragrances: 38, image: '/api/placeholder/100/100' },
    { name: 'Tom Ford', fragrances: 67, image: '/api/placeholder/100/100' },
    { name: 'Creed', fragrances: 52, image: '/api/placeholder/100/100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section - FIXED */}
      <section className="relative bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 py-20 px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-bold text-3xl flex items-center shadow-xl">
              <Sparkles className="w-8 h-8 mr-3" />
              FragView
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Discover Your
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Perfect Scent
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto transition-colors duration-300">
            Explore thousands of fragrances, read authentic reviews, and build your personal scent wardrobe with FragView
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/discover" className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow">
              Start Exploring
            </Link>
            <Link href="/brands" className="border-2 border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400 px-8 py-3 rounded-full font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              Browse Brands
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - FIXED */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Fragrances</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Brands</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">50,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Reviews</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">25,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fragrances - FIXED */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-primary-50/20 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Featured Fragrances</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Discover the most loved and highly rated fragrances by our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPerfumes.map((perfume) => (
              <div key={perfume.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                <div className="aspect-w-3 aspect-h-4 bg-gray-100 dark:bg-gray-700">
                  <div className="w-full h-64 bg-gradient-to-br from-pastel-blue to-pastel-purple opacity-20"></div>
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {perfume.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{perfume.brand}</p>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">{perfume.rating}</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({perfume.reviews} reviews)</span>
                  </div>

                  <div className="mb-4">
                    <AccordTags accords={perfume.accords} />
                  </div>
                  
                  <Link href={`/perfume/${perfume.id}`} className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white text-center py-2 rounded-lg font-medium hover:shadow-lg transition-shadow block">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Brands - FIXED */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Trending Brands</h2>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Explore the most popular fragrance houses</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingBrands.map((brand, index) => (
              <Link key={index} href={`/brand/${brand.name.toLowerCase()}`}>
                <div className="text-center p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group border border-gray-100 dark:border-gray-700">
                  <div className="w-20 h-20 bg-gradient-to-br from-pastel-blue to-pastel-purple rounded-full mx-auto mb-4 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{brand.fragrances} fragrances</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Already has proper dark theme */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Signature Scent?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of fragrance enthusiasts on FragView and start building your scent wardrobe today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow">
              Sign Up Free
            </button>
            <Link href="/discover" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
              Explore Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;