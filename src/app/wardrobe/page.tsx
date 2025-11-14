'use client';
import React, { useState , useEffect} from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Star, Filter, Grid, List, Leaf, Flower2, Trees, Sparkles } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/components/auth/AuthModal';

const WardrobePage = () => {
  // ✅ Hooks first, every render
  const { data: session, status } = useSession();
  const { open } = useAuthModal();

  const [activeCategory, setActiveCategory] = useState('My Bottles');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedFragrances, setSelectedFragrances] = useState<number[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      open({ mode: 'signin', reason: 'Sign in to view your wardrobe' });
    }
  }, [status, open]);

  // Loading and unauth states AFTER hooks
  if (status === 'loading') {
    return (
      <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
        <div className="mx-auto max-w-4xl p-6">
          <div className="glass-card rounded-lg p-4 text-sm text-gray-600">
            Loading…
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
        <div className="mx-auto max-w-md p-6">
          <div className="space-y-3 glass-card rounded-xl p-6">
            <h1 className="text-xl font-semibold text-gray-800">Sign in required</h1>
            <p className="text-sm text-gray-600">A sign-in popup should be visible. After signing in, you'll see your wardrobe here.</p>
          </div>
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
    <div key={fragrance.id} className="glass-card rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02]">
      <div className="aspect-square bg-gradient-to-br from-green-50/50 to-orange-50/50 flex items-center justify-center relative">
        <Sparkles className="w-12 h-12 text-green-300" />
        <div className="absolute top-2 right-2 opacity-30">
          <Leaf size={24} className="text-green-500" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900">{fragrance.name}</h3>
            <p className="text-sm text-gray-600">{fragrance.brand}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-green-50 transition-colors">
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4 text-sm mt-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-orange-400 fill-current" />
            <span className="ml-1 text-gray-900">{fragrance.rating}</span>
          </div>
          {fragrance.myRating && (
            <div className="flex items-center">
              <span className="text-gray-600">My:</span>
              <Star className="w-4 h-4 text-green-400 fill-current ml-1" />
              <span className="ml-1 text-gray-900">{fragrance.myRating}</span>
            </div>
          )}
          {fragrance.priority && (
            <span className={`px-2 py-1 rounded text-xs ${
              fragrance.priority === 'High' ? 'bg-red-100 text-red-700' :
              fragrance.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
              'bg-green-100 text-green-700'
            }`}>
              {fragrance.priority}
            </span>
          )}
        </div>

        <AccordTags accords={fragrance.accords} className="mb-4" />

        {fragrance.notes && (
          <p className="text-gray-600 text-sm mb-4 italic">"{fragrance.notes}"</p>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Added: {fragrance.dateAdded}</span>
          <button 
            onClick={() => handleSelectFragrance(fragrance.id)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              selectedFragrances.includes(fragrance.id)
                ? 'bg-green-500 text-white border-transparent'
                : 'text-gray-700 border-green-200 hover:bg-green-50'
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
      className="flex items-center justify-between p-4 glass-card rounded-lg hover:shadow-md transition-all"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded bg-gradient-to-br from-green-100 to-orange-100 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{fragrance.name}</h3>
          <p className="text-sm text-gray-600">{fragrance.brand}</p>
          <div className="text-xs text-gray-500">{fragrance.family}</div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Star className="w-4 h-4 text-orange-400 fill-current" />
          <span className="ml-1 text-gray-900">{fragrance.rating}</span>
        </div>
        {fragrance.myRating && (
          <div className="flex items-center">
            <span className="text-gray-600">My:</span>
            <Star className="w-4 h-4 text-green-400 fill-current ml-1" />
            <span className="ml-1 text-gray-900">{fragrance.myRating}</span>
          </div>
        )}
        {fragrance.priority && (
          <span className={`px-2 py-1 rounded text-xs ${
            fragrance.priority === 'High' ? 'bg-red-100 text-red-700' :
            fragrance.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
            'bg-green-100 text-green-700'
          }`}>
            {fragrance.priority}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-full hover:bg-green-50 transition-colors">
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-red-50 transition-colors">
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
        <button 
          onClick={() => handleSelectFragrance(fragrance.id)}
          className={`px-3 py-1 rounded-full border transition-colors ${
            selectedFragrances.includes(fragrance.id)
              ? 'bg-green-500 text-white border-transparent'
              : 'text-gray-700 border-green-200 hover:bg-green-50'
          }`}
        >
          {selectedFragrances.includes(fragrance.id) ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
        
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Header - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl shadow-sm p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Trees size={150} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-4">My Wardrobe</h1>
              <p className="text-gray-600">
                Manage your fragrance collection across different categories
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">{allFragrances.length}</div>
              <div className="text-gray-600 text-sm">Total Fragrances</div>
            </div>
          </div>
        </div>

        {/* Category Tabs - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl shadow-sm mb-8">
          <div className="border-b border-green-100">
            <div className="flex space-x-8 px-8 py-4">
              {Object.keys(categories).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeCategory === category
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {category}
                </button>
              ))}
              <div className="ml-auto flex space-x-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50'} transition-colors`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50'} transition-colors`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-green-50 transition-colors" title="Filters">
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
                    className="px-4 py-2 rounded-full border border-green-200 text-gray-700 hover:bg-green-50 transition-colors"
                  >
                    {subcat}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowSubcategoryModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-shadow"
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

          {/* Sidebar - BOTANICAL THEME */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Fragrance
                </button>
                <button className="w-full px-4 py-2 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                  Export Wardrobe
                </button>
                <button className="w-full px-4 py-2 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                  Import from CSV
                </button>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Summary</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Total</span><span>{allFragrances.length}</span></div>
                  <div className="flex justify-between"><span>My Bottles</span><span>{categories['My Bottles'].fragrances.length}</span></div>
                  <div className="flex justify-between"><span>Wishlist</span><span>{categories['Wishlist'].fragrances.length}</span></div>
                  <div className="flex justify-between"><span>Past Bottles</span><span>{categories['Past Bottles'].fragrances.length}</span></div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-gradient-to-br from-green-50 to-orange-50 rounded-2xl p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-green-700 mb-2 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Wardrobe Tips
              </h4>
              <p className="text-green-700 text-sm">
                Organize your wardrobe with subcategories like Daily Wear, Office, and Special Occasions to find the perfect scent faster.
              </p>
            </div>
          </div>
        </div>

        {/* Add Modal - BOTANICAL THEME */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-card rounded-xl p-6 w-full max-w-md relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-5">
                <Flower2 size={100} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 relative z-10">Add Fragrance</h3>
              <div className="space-y-3 relative z-10">
                <input className="w-full p-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80" placeholder="Name" />
                <input className="w-full p-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80" placeholder="Brand" />
                <select className="w-full p-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80">
                  <option>My Bottles</option>
                  <option>Wishlist</option>
                  <option>Past Bottles</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-green-200 rounded hover:bg-green-50">Cancel</button>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded">Add</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subcategory Modal - BOTANICAL THEME */}
        {showSubcategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-card rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Subcategories</h3>
              <div className="space-y-3">
                <input className="w-full p-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80" placeholder="Add new subcategory" />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowSubcategoryModal(false)} className="px-4 py-2 border border-green-200 rounded hover:bg-green-50">Close</button>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WardrobePage;