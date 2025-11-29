'use client';

import { useState } from 'react';
import { Package, Building2, Plus, X, Search, Loader2, Save, GripVertical } from 'lucide-react';
import { setFeaturedPerfumes, setTrendingBrands, searchPerfumes, searchBrands } from '@/app/actions/admin/featured';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface FeaturedItem {
  id: string;
  mongoId: string;
  name: string;
  brandName?: string;
  image?: string;
  position: number;
}

interface Props {
  initialData: {
    featuredPerfumes: FeaturedItem[];
    trendingBrands: FeaturedItem[];
  };
}

export default function FeaturedContentManager({ initialData }: Props) {
  const [featuredPerfumes, setFeaturedPerfumesState] = useState(initialData.featuredPerfumes);
  const [trendingBrands, setTrendingBrandsState] = useState(initialData.trendingBrands);
  const [activeTab, setActiveTab] = useState<'perfumes' | 'brands'>('perfumes');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = activeTab === 'perfumes' 
        ? await searchPerfumes(searchQuery)
        : await searchBrands(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console. error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const addItem = (item: any) => {
    if (activeTab === 'perfumes') {
      const exists = featuredPerfumes.find(p => p.mongoId === item._id);
      if (exists) {
        alert('This perfume is already featured');
        return;
      }
      
      setFeaturedPerfumesState([
        ...featuredPerfumes,
        {
          id: `temp-${Date.now()}`,
          mongoId: item._id,
          name: item.name,
          brandName: item.brand_name,
          image: item. image,
          position: featuredPerfumes.length,
        },
      ]);
    } else {
      const exists = trendingBrands. find(b => b.mongoId === item._id);
      if (exists) {
        alert('This brand is already in trending');
        return;
      }
      
      setTrendingBrandsState([
        ...trendingBrands,
        {
          id: `temp-${Date.now()}`,
          mongoId: item._id,
          name: item.name,
          image: item.logo,
          position: trendingBrands.length,
        },
      ]);
    }
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeItem = (mongoId: string) => {
    if (activeTab === 'perfumes') {
      setFeaturedPerfumesState(featuredPerfumes.filter(p => p.mongoId !== mongoId));
    } else {
      setTrendingBrandsState(trendingBrands.filter(b => b.mongoId !== mongoId));
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = activeTab === 'perfumes' ?  [... featuredPerfumes] : [... trendingBrands];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination. index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({ ...item, position: index }));

    if (activeTab === 'perfumes') {
      setFeaturedPerfumesState(updatedItems);
    } else {
      setTrendingBrandsState(updatedItems);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'perfumes') {
        const result = await setFeaturedPerfumes(featuredPerfumes. map(p => p.mongoId));
        if (result.success) {
          alert('✅ Featured perfumes updated! ');
        } else {
          alert('❌ Error: ' + result.error);
        }
      } else {
        const result = await setTrendingBrands(trendingBrands.map(b => b. mongoId));
        if (result.success) {
          alert('✅ Trending brands updated! ');
        } else {
          alert('❌ Error: ' + result.error);
        }
      }
    } catch (error) {
      alert('❌ Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const currentItems = activeTab === 'perfumes' ? featuredPerfumes : trendingBrands;
  const maxItems = activeTab === 'perfumes' ? 12 : 8;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab('perfumes');
              setSearchQuery('');
              setSearchResults([]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'perfumes'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Featured Perfumes ({featuredPerfumes.length}/{maxItems})
          </button>
          <button
            onClick={() => {
              setActiveTab('brands');
              setSearchQuery('');
              setSearchResults([]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'brands'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Trending Brands ({trendingBrands.length}/{maxItems})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {activeTab === 'perfumes' ? 'Search Perfumes' : 'Search Brands'}
        </h3>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e. key === 'Enter' && handleSearch()}
              placeholder={`Search ${activeTab === 'perfumes' ? 'perfumes' : 'brands'}...`}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searching ?  <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((result) => (
              <div
                key={result._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {result.image || result.logo ? (
                    <img
                      src={result.image || result.logo}
                      alt={result.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {activeTab === 'perfumes' ?  (
                        <Package className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{result.name}</p>
                    {result. brand_name && (
                      <p className="text-sm text-gray-500">{result.brand_name}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => addItem(result)}
                  className="flex items-center gap-1 px-3 py-1. 5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Current {activeTab === 'perfumes' ? 'Featured Perfumes' : 'Trending Brands'}
          </h3>
          <button
            onClick={handleSave}
            disabled={saving || currentItems.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {currentItems.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p>No items selected</p>
            <p className="text-sm mt-1">Search and add items above</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="featured-items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {currentItems.map((item, index) => (
                    <Draggable key={item.mongoId} draggableId={item.mongoId} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div {... provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          
                          <span className="text-sm font-medium text-gray-500 w-8">
                            #{index + 1}
                          </span>

                          {item.image ?  (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              {activeTab === 'perfumes' ? (
                                <Package className="w-6 h-6 text-gray-400" />
                              ) : (
                                <Building2 className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          )}

                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item. brandName && (
                              <p className="text-sm text-gray-500">{item.brandName}</p>
                            )}
                          </div>

                          <button
                            onClick={() => removeItem(item.mongoId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {currentItems.length >= maxItems && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              ⚠️ Maximum of {maxItems} items reached.  Remove some items to add more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}