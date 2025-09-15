'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Grid, List } from 'lucide-react';

const BrandsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [selectedLetter, setSelectedLetter] = useState('All');

  // Mock data with more brands for A-Z demo
  const brands = [
    { id: 1, name: 'Amouage', country: 'Oman', founded: 1983, fragranceCount: 78, description: 'Luxury Omani perfume house.' },
    { id: 2, name: 'Acqua di Parma', country: 'Italy', founded: 1916, fragranceCount: 45, description: 'Italian luxury fragrance house.' },
    { id: 3, name: 'Bond No. 9', country: 'USA', founded: 2003, fragranceCount: 89, description: 'New York-inspired fragrances.' },
    { id: 4, name: 'Byredo', country: 'Sweden', founded: 2006, fragranceCount: 34, description: 'Modern Swedish luxury.' },
    { id: 5, name: 'Chanel', country: 'France', founded: 1910, fragranceCount: 38, description: 'Iconic French fashion house.' },
    { id: 6, name: 'Creed', country: 'France', founded: 1760, fragranceCount: 52, description: 'Historic French perfume house.' },
    { id: 7, name: 'Dior', country: 'France', founded: 1946, fragranceCount: 45, description: 'French luxury fashion house.' },
    { id: 8, name: 'Dolce & Gabbana', country: 'Italy', founded: 1985, fragranceCount: 67, description: 'Italian luxury brand.' },
    { id: 9, name: 'Escentric Molecules', country: 'Germany', founded: 2006, fragranceCount: 12, description: 'Molecular perfumery.' },
    { id: 10, name: 'Frederic Malle', country: 'France', founded: 2000, fragranceCount: 23, description: 'Artistic perfume publisher.' },
    { id: 11, name: 'Giorgio Armani', country: 'Italy', founded: 1975, fragranceCount: 41, description: 'Italian luxury fashion house.' },
    { id: 12, name: 'Guerlain', country: 'France', founded: 1828, fragranceCount: 89, description: 'Historic French perfumer.' },
    { id: 13, name: 'Hermès', country: 'France', founded: 1837, fragranceCount: 34, description: 'French luxury goods manufacturer.' },
    { id: 14, name: 'Jo Malone', country: 'UK', founded: 1994, fragranceCount: 56, description: 'British fragrance house.' },
    { id: 15, name: 'Kilian', country: 'France', founded: 2007, fragranceCount: 28, description: 'Luxury niche perfumery.' },
    { id: 16, name: 'Le Labo', country: 'France', founded: 2006, fragranceCount: 19, description: 'Artisanal French perfumery.' },
    { id: 17, name: 'Maison Margiela', country: 'France', founded: 2009, fragranceCount: 45, description: 'Avant-garde French house.' },
    { id: 18, name: 'Nasomatto', country: 'Netherlands', founded: 2007, fragranceCount: 8, description: 'Artistic niche perfumery.' },
    { id: 19, name: 'Ormonde Jayne', country: 'UK', founded: 2002, fragranceCount: 23, description: 'British luxury perfumery.' },
    { id: 20, name: 'Penhaligon\'s', country: 'UK', founded: 1870, fragranceCount: 67, description: 'British heritage perfumer.' },
    { id: 21, name: 'Tom Ford', country: 'USA', founded: 2005, fragranceCount: 67, description: 'American luxury brand.' },
    { id: 22, name: 'Versace', country: 'Italy', founded: 1978, fragranceCount: 54, description: 'Italian luxury fashion house.' },
    { id: 23, name: 'Yves Saint Laurent', country: 'France', founded: 1961, fragranceCount: 34, description: 'French luxury fashion house.' },
  ];

  // Create A-Z letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Get available letters (letters that have brands)
  const availableLetters = alphabet.filter(letter => 
    brands.some(brand => brand.name.toUpperCase().startsWith(letter))
  );

  // Filter brands
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brand.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = selectedLetter === 'All' || 
                         brand.name.toUpperCase().startsWith(selectedLetter);
    return matchesSearch && matchesLetter;
  });

  const sortedBrands = [...filteredBrands].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'country':
        return a.country.localeCompare(b.country);
      case 'founded':
        return a.founded - b.founded;
      case 'fragrances':
        return b.fragranceCount - a.fragranceCount;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Brand Directory</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Explore fragrance houses from around the world and discover their iconic scents
            </p>
          </div>

          {/* Search and Filter Bar - FIXED */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search brands or countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
              >
                <option value="name">Sort by Name</option>
                <option value="country">Sort by Country</option>
                <option value="founded">Sort by Founded</option>
                <option value="fragrances">Sort by Fragrances</option>
              </select>

              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors duration-300 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors duration-300 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* A-Z Filter - FIXED */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 transition-colors duration-300">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Browse by Letter:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLetter('All')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  selectedLetter === 'All'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {alphabet.map(letter => {
                const hasData = availableLetters.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => hasData && setSelectedLetter(letter)}
                    disabled={!hasData}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                      selectedLetter === letter
                        ? 'bg-primary-500 text-white'
                        : hasData
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Count - FIXED */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Showing {sortedBrands.length} of {brands.length} brands
            {selectedLetter !== 'All' && ` starting with "${selectedLetter}"`}
          </p>
        </div>

        {/* Brands Grid/List - FIXED */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedBrands.map((brand) => (
              <Link key={brand.id} href={`/brand/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                  <div className="h-48 bg-gradient-to-br from-pastel-blue to-pastel-purple opacity-20 dark:opacity-30"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {brand.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded transition-colors duration-300">
                        {brand.country}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 transition-colors duration-300">
                      {brand.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      <span>Founded: {brand.founded}</span>
                      <span>{brand.fragranceCount} fragrances</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBrands.map((brand) => (
              <Link key={brand.id} href={`/brand/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 group border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-pastel-blue to-pastel-purple rounded-lg opacity-20 dark:opacity-30"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {brand.name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded transition-colors duration-300">
                          {brand.country}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-300">
                        {brand.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        <span>Founded: {brand.founded}</span>
                        <span>{brand.fragranceCount} fragrances</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {sortedBrands.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors duration-300">
              No brands found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLetter('All');
              }}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium mt-2 transition-colors duration-300"
            >
              Clear filters and try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;