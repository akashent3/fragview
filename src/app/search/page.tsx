'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, X, Star } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';
import RatingSlider from '@/components/ui/RatingSlider';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    notes: [] as string[],
    year: { min: 1900, max: 2024 },
    perfumer: '',
    longevity: { min: 1, max: 5 },
    sillage: { min: 1, max: 5 },
    rating: { min: 1, max: 5 },
    gender: 'all',
    accords: [] as string[]
  });
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced mock data with perfumers
  const brands = ['Dior', 'Chanel', 'Tom Ford', 'Creed', 'YSL', 'Giorgio Armani'];
  const notes = ['Rose', 'Bergamot', 'Vanilla', 'Oud', 'Lavender', 'Sandalwood', 'Jasmine', 'Cedar', 'Patchouli', 'Lemon'];
  const perfumers = [
    'François Demachy', 'Jacques Polge', 'Olivier Polge', 'Christine Nagel', 
    'Alberto Morillas', 'Calice Becker', 'Dominique Ropion', 'Jean-Claude Ellena',
    'Thierry Wasser', 'Nathalie Lorson', 'Sophia Grojsman', 'Maurice Roucel'
  ];
  const accords = ['Fresh', 'Woody', 'Floral', 'Oriental', 'Spicy', 'Sweet', 'Citrus', 'Aquatic', 'Smoky', 'Green'];

  const searchResults = [
    {
      id: 1,
      name: 'Sauvage',
      brand: 'Dior',
      year: 2015,
      perfumer: 'François Demachy',
      gender: 'Male',
      rating: 4.3,
      reviews: 1247,
      longevity: 4.2,
      sillage: 4.5,
      accords: [{ name: 'fresh' }, { name: 'woody' }, { name: 'spicy' }]
    }
  ];

  const addFilter = (type: string, value: string) => {
    if (type === 'notes' || type === 'accords') {
      setFilters(prev => ({
        ...prev,
        [type]: prev[type as keyof typeof prev].includes(value) 
          ? (prev[type as keyof typeof prev] as string[]).filter(item => item !== value)
          : [...(prev[type as keyof typeof prev] as string[]), value]
      }));
    } else {
      setFilters(prev => ({ ...prev, [type]: value }));
    }
  };

  const removeFilter = (type: string, value?: string) => {
    if (type === 'notes' || type === 'accords') {
      setFilters(prev => ({
        ...prev,
        [type]: value ? (prev[type as keyof typeof prev] as string[]).filter(item => item !== value) : []
      }));
    } else {
      setFilters(prev => ({ ...prev, [type]: type === 'gender' ? 'all' : '' }));
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.brand) count++;
    if (filters.notes.length > 0) count++;
    if (filters.perfumer) count++;
    if (filters.gender !== 'all') count++;
    if (filters.accords.length > 0) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header - FIXED */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Fragrance Search</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Find your perfect fragrance using our advanced search filters
          </p>
        </div>

        {/* Search Bar - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search fragrances, brands, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Filters Sidebar - FIXED */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-6`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sticky top-24 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Filters</h2>
                <button
                  onClick={() => setFilters({
                    brand: '', notes: [], year: { min: 1900, max: 2024 }, perfumer: '',
                    longevity: { min: 1, max: 5 }, sillage: { min: 1, max: 5 }, rating: { min: 1, max: 5 },
                    gender: 'all', accords: []
                  })}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-300"
                >
                  Clear All
                </button>
              </div>

              {/* Brand Filter - FIXED */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Brand</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => addFilter('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Perfumer Filter - FIXED */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Perfumer</h3>
                <select
                  value={filters.perfumer}
                  onChange={(e) => addFilter('perfumer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                >
                  <option value="">All Perfumers</option>
                  {perfumers.map(perfumer => (
                    <option key={perfumer} value={perfumer}>{perfumer}</option>
                  ))}
                </select>
              </div>

              {/* Gender Filter - FIXED */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Gender</h3>
                <div className="space-y-2">
                  {['all', 'male', 'female', 'unisex'].map(gender => (
                    <label key={gender} className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={filters.gender === gender}
                        onChange={(e) => addFilter('gender', e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize transition-colors duration-300">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Year Range - FIXED */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Release Year</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    min="1900"
                    max="2024"
                    value={filters.year.min}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: { ...prev.year, min: parseInt(e.target.value) || 1900 } }))}
                    className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                  <input
                    type="number"
                    placeholder="To"
                    min="1900"
                    max="2024"
                    value={filters.year.max}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: { ...prev.year, max: parseInt(e.target.value) || 2024 } }))}
                    className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                </div>
              </div>

              {/* Rating Sliders - FIXED */}
              <div className="mb-6 space-y-4">
                <RatingSlider
                  label="Minimum Rating"
                  value={filters.rating.min}
                  onChange={(value) => setFilters(prev => ({ ...prev, rating: { ...prev.rating, min: value } }))}
                />
                <RatingSlider
                  label="Minimum Longevity"
                  value={filters.longevity.min}
                  onChange={(value) => setFilters(prev => ({ ...prev, longevity: { ...prev.longevity, min: value } }))}
                />
                <RatingSlider
                  label="Minimum Sillage"
                  value={filters.sillage.min}
                  onChange={(value) => setFilters(prev => ({ ...prev, sillage: { ...prev.sillage, min: value } }))}
                />
              </div>

              {/* Notes - FIXED */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Notes</h3>
                <div className="flex flex-wrap gap-1">
                  {notes.map(note => (
                    <button
                      key={note}
                      onClick={() => addFilter('notes', note)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors duration-300 ${
                        filters.notes.includes(note)
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accords - FIXED */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Accords</h3>
                <div className="flex flex-wrap gap-1">
                  {accords.map(accord => (
                    <button
                      key={accord}
                      onClick={() => addFilter('accords', accord)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors duration-300 ${
                        filters.accords.includes(accord)
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-600'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                    >
                      {accord}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search Results - FIXED */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Found {searchResults.length} fragrances
                </p>
                <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300">
                  <option>Sort by Relevance</option>
                  <option>Sort by Rating</option>
                  <option>Sort by Reviews</option>
                  <option>Sort by Year</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {searchResults.map((fragrance) => (
                <div key={fragrance.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="flex">
                    <div className="w-48 h-48 bg-gradient-to-br from-pastel-blue to-pastel-purple opacity-20 dark:opacity-30"></div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors duration-300">
                            {fragrance.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{fragrance.brand}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            <span>{fragrance.year}</span>
                            <span className="mx-2">•</span>
                            <span>{fragrance.gender}</span>
                            <span className="mx-2">•</span>
                            <span>{fragrance.perfumer}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">{fragrance.rating}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">{fragrance.reviews} reviews</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <AccordTags accords={fragrance.accords} />
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          <div>
                            <span className="text-gray-500 dark:text-gray-500">Longevity:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{fragrance.longevity}/5</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-500">Sillage:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{fragrance.sillage}/5</span>
                          </div>
                        </div>
                        <Link href={`/perfume/${fragrance.id}`} className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;