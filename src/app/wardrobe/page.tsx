'use client';
import React, { useState , useEffect} from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Star, Filter, Grid, List } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/components/auth/AuthModal';

const WardrobePage = () => {
  // ✅ Hooks first, every render
  const { user: authUser, loading } = useAuth() as any;
  const { open } = useAuthModal();

  const [activeCategory, setActiveCategory] = useState('My Bottles');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedFragrances, setSelectedFragrances] = useState<number[]>([]);

  useEffect(() => {
    if (!loading && !authUser) {
      open({ mode: 'signin', reason: 'Sign in to view your wardrobe' });
    }
  }, [loading, authUser, open]);

  // Loading and unauth states AFTER hooks
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
          Loading…
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="mx-auto max-w-md p-6">
        <div className="space-y-3 rounded-xl border border-gray-200 p-6 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sign in required</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">A sign-in popup should be visible. After signing in, you’ll see your wardrobe here.</p>
        </div>
      </div>
    );
  }

  // Mock data (unchanged)
  const categories = {
    'My Bottles': {
      subcategories: ['Daily Wear', 'Special Occasions', 'Office'],
      fragrances: [
        { id: 1, name: 'Dior Sauvage', brand: 'Dior', rating: 4.5, myRating: 4.7, family: 'Fresh', accords: [{ name: 'fresh' }, { name: 'woody' }], notes: 'Great for daily wear', dateAdded: '2023-09-01', subcategory: 'Daily Wear' },
        { id: 2, name: 'Bleu de Chanel', brand: 'Chanel', rating: 4.6, myRating: 4.8, family: 'Fresh', accords: [{ name: 'fresh' }, { name: 'citrus' }], dateAdded: '2023-08-15', subcategory: 'Office' },
        { id: 3, name: 'Aventus', brand: 'Creed', rating: 4.7, family: 'Woody', accords: [{ name: 'woody' }, { name: 'fruity' }], dateAdded: '2023-07-20', subcategory: 'Special Occasions' }
      ]
    },
    'Wishlist': {
      subcategories: ['To Try', 'Gift Ideas'],
      fragrances: [
        { id: 4, name: 'Tom Ford Oud Wood', brand: 'Tom Ford', rating: 4.6, family: 'Woody', accords: [{ name: 'woody' }, { name: 'oriental' }], priority: 'High', dateAdded: '2023-10-05', subcategory: 'To Try' },
        { id: 5, name: "La Nuit de L'Homme", brand: 'YSL', rating: 4.3, family: 'Oriental', accords: [{ name: 'spicy' }, { name: 'woody' }], dateAdded: '2023-09-25', subcategory: 'Gift Ideas' }
      ]
    },
    'Past Bottles': {
      subcategories: ['Empties', 'Decluttered'],
      fragrances: [
        { id: 6, name: 'CK One', brand: 'Calvin Klein', rating: 4.0, family: 'Fresh', accords: [{ name: 'fresh' }, { name: 'citrus' }], dateAdded: '2023-06-11', subcategory: 'Empties' },
        { id: 7, name: 'Acqua di Gio', brand: 'Armani', rating: 4.2, family: 'Fresh', accords: [{ name: 'fresh' }, { name: 'aquatic' }], dateAdded: '2023-05-08', subcategory: 'Decluttered' }
      ]
    }
  };

  const allFragrances = Object.values(categories).flatMap(cat => (cat as any).fragrances);

  const handleSelectFragrance = (id: number) => {
    setSelectedFragrances(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const renderFragranceCard = (fragrance: any) => (
    <div key={fragrance.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"></div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{fragrance.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{fragrance.brand}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Trash2 className="w-4 h-4 text-red-500" />
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
              fragrance.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
              fragrance.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
              'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
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
          <button 
            onClick={() => handleSelectFragrance(fragrance.id)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              selectedFragrances.includes(fragrance.id)
                ? 'bg-primary-500 text-white border-transparent'
                : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {selectedFragrances.includes(fragrance.id) ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderFragranceRow = (fragrance: any) => (
    <div 
      key={fragrance.id}
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"></div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{fragrance.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{fragrance.brand}</p>
          <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{fragrance.family}</div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
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
            fragrance.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
            fragrance.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          }`}>
            {fragrance.priority}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
        <button 
          onClick={() => handleSelectFragrance(fragrance.id)}
          className={`px-3 py-1 rounded-full border transition-colors ${
            selectedFragrances.includes(fragrance.id)
              ? 'bg-primary-500 text-white border-transparent'
              : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {selectedFragrances.includes(fragrance.id) ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center justify-between">
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

        {/* Category Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-8 py-4">
              {Object.keys(categories).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeTabClass(activeCategory, category)
                  }`}
                >
                  {category}
                </button>
              ))}
              <div className="ml-auto flex space-x-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Filters">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Subcategory Bar */}
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4 overflow-x-auto whitespace-nowrap">
                {categories[activeCategory as keyof typeof categories].subcategories.map((subcat: string) => (
                  <button 
                    key={subcat}
                    className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {subcat}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowSubcategoryModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Manage Subcategories
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {categories[activeCategory as keyof typeof categories].fragrances.map((fragrance: any) => renderFragranceCard(fragrance))}
              </div>
            ) : (
              <div className="space-y-4">
                {categories[activeCategory as keyof typeof categories].fragrances.map((fragrance: any) => renderFragranceRow(fragrance))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Fragrance
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Export Wardrobe
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Import from CSV
                </button>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Summary</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  <div className="flex justify-between"><span>Total</span><span>{allFragrances.length}</span></div>
                  <div className="flex justify-between"><span>My Bottles</span><span>{categories['My Bottles'].fragrances.length}</span></div>
                  <div className="flex justify-between"><span>Wishlist</span><span>{categories['Wishlist'].fragrances.length}</span></div>
                  <div className="flex justify-between"><span>Past Bottles</span><span>{categories['Past Bottles'].fragrances.length}</span></div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 transition-colors duration-300">
              <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2 transition-colors duration-300">Wardrobe Tips</h4>
              <p className="text-blue-700/80 dark:text-blue-300/90 text-sm transition-colors duration-300">
                Organize your wardrobe with subcategories like Daily Wear, Office, and Special Occasions to find the perfect scent faster.
              </p>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Add Fragrance</h3>
              <div className="space-y-3">
                <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" placeholder="Name" />
                <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" placeholder="Brand" />
                <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                  <option>My Bottles</option>
                  <option>Wishlist</option>
                  <option>Past Bottles</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                  <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded">Add</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subcategory Modal */}
        {showSubcategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Manage Subcategories</h3>
              <div className="space-y-3">
                <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" placeholder="Add new subcategory" />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowSubcategoryModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
                  <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Helper for active tab style
function activeTabClass(active: string, current: string) {
  return active === current
    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200';
}

export default WardrobePage;
