'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Star, Filter, Grid, List } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';

const WardrobePage = () => {
  const [activeCategory, setActiveCategory] = useState('My Bottles');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedFragrances, setSelectedFragrances] = useState<number[]>([]);

  // Mock data
  const categories = {
    'My Bottles': {
      subcategories: ['Daily Wear', 'Special Occasions', 'Fresh Collection', 'Winter Favorites'],
      fragrances: [
        {
          id: 1,
          name: 'Sauvage',
          brand: 'Dior',
          subcategory: 'Daily Wear',
          rating: 4.3,
          myRating: 4.5,
          dateAdded: '2024-01-15',
          notes: 'Perfect for office wear',
          accords: [{ name: 'fresh' }, { name: 'woody' }, { name: 'spicy' }]
        },
        {
          id: 2,
          name: 'Tom Ford Oud Wood',
          brand: 'Tom Ford',
          subcategory: 'Special Occasions',
          rating: 4.7,
          myRating: 5.0,
          dateAdded: '2023-12-20',
          notes: 'Amazing for evening events',
          accords: [{ name: 'woody' }, { name: 'oriental' }, { name: 'smoky' }]
        }
      ]
    },
    'Wishlist': {
      subcategories: ['Must Have', 'Maybe Later', 'Seasonal Wants'],
      fragrances: [
        {
          id: 3,
          name: 'Black Opium',
          brand: 'Yves Saint Laurent',
          subcategory: 'Must Have',
          rating: 4.5,
          priority: 'High',
          dateAdded: '2024-02-10',
          notes: 'Want to try this for date nights',
          accords: [{ name: 'oriental' }, { name: 'gourmand' }, { name: 'sweet' }]
        }
      ]
    },
    'Past Bottles': {
      subcategories: ['Finished', 'Gave Away', 'Lost Interest'],
      fragrances: [
        {
          id: 4,
          name: 'Acqua di Gio',
          brand: 'Giorgio Armani',
          subcategory: 'Finished',
          rating: 4.1,
          myRating: 3.8,
          dateAdded: '2023-06-15',
          dateRemoved: '2024-01-20',
          notes: 'Good but got tired of it',
          accords: [{ name: 'aquatic' }, { name: 'fresh' }, { name: 'marine' }]
        }
      ]
    }
  };

  const allFragrances = Object.values(categories).flatMap(cat => cat.fragrances);
  const currentFragrances = categories[activeCategory as keyof typeof categories]?.fragrances || [];
  const currentSubcategories = categories[activeCategory as keyof typeof categories]?.subcategories || [];

  const renderFragranceCard = (fragrance: any) => (
    <div key={fragrance.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
      <div className="h-48 bg-gradient-to-br from-pastel-blue to-pastel-purple opacity-20 dark:opacity-30"></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {fragrance.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{fragrance.brand}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded transition-colors duration-300">
              {fragrance.subcategory}
            </span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4 text-sm">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-gray-900 dark:text-white">{fragrance.rating}</span>
          </div>
          {fragrance.myRating && (
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400">My:</span>
              <Star className="w-4 h-4 text-purple-400 fill-current ml-1" />
              <span className="ml-1 text-gray-900 dark:text-white">{fragrance.myRating}</span>
            </div>
          )}
          {fragrance.priority && (
            <span className={`px-2 py-1 rounded text-xs ${
              fragrance.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}>
              {fragrance.priority}
            </span>
          )}
        </div>

        <AccordTags accords={fragrance.accords} className="mb-4" />

        {fragrance.notes && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 italic transition-colors duration-300">"{fragrance.notes}"</p>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
          <span>Added: {fragrance.dateAdded}</span>
          {fragrance.dateRemoved && <span>Removed: {fragrance.dateRemoved}</span>}
        </div>
      </div>
    </div>
  );

  const renderFragranceList = (fragrance: any) => (
    <div key={fragrance.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 group border border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-6">
        <div className="w-16 h-20 bg-gradient-to-br from-pastel-blue to-pastel-purple rounded-lg opacity-20 dark:opacity-30"></div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {fragrance.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{fragrance.brand}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-3">
            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded transition-colors duration-300">
              {fragrance.subcategory}
            </span>
            <div className="flex items-center text-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-gray-900 dark:text-white">{fragrance.rating}</span>
            </div>
            {fragrance.myRating && (
              <div className="flex items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">My:</span>
                <Star className="w-4 h-4 text-purple-400 fill-current ml-1" />
                <span className="ml-1 text-gray-900 dark:text-white">{fragrance.myRating}</span>
              </div>
            )}
          </div>

          <AccordTags accords={fragrance.accords} className="mb-3" />

          {fragrance.notes && (
            <p className="text-gray-600 dark:text-gray-300 text-sm italic mb-2 transition-colors duration-300">"{fragrance.notes}"</p>
          )}

          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
            <span>Added: {fragrance.dateAdded}</span>
            {fragrance.dateRemoved && <span>Removed: {fragrance.dateRemoved}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">My Wardrobe</h1>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Manage your fragrance collection across different categories
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{allFragrances.length}</div>
              <div className="text-gray-500 dark:text-gray-400">Total Fragrances</div>
            </div>
          </div>
        </div>

        {/* Category Tabs - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {Object.keys(categories).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeCategory === category
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {category}
                <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full transition-colors duration-300">
                  {categories[category as keyof typeof categories].fragrances.length}
                </span>
              </button>
            ))}
          </div>

          {/* Controls - FIXED */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fragrance
                </button>
                <button
                  onClick={() => setShowSubcategoryModal(true)}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Manage Subcategories
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300">
                  <option>All Subcategories</option>
                  {currentSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>

                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors duration-300 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors duration-300 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fragrances Display - FIXED */}
          <div className="p-6">
            {currentFragrances.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentFragrances.map(renderFragranceCard)}
                </div>
              ) : (
                <div className="space-y-4">
                  {currentFragrances.map(renderFragranceList)}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Plus className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">No fragrances in {activeCategory}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">Start building your collection by adding your first fragrance.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  Add Your First Fragrance
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subcategories Overview - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Subcategories in {activeCategory}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentSubcategories.map((subcategory) => {
              const count = currentFragrances.filter(f => f.subcategory === subcategory).length;
              return (
                <div key={subcategory} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer border border-gray-100 dark:border-gray-600">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{subcategory}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardrobePage;