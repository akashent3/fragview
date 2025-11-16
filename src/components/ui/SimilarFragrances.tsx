'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, X, Star, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface SimilarFragrance {
  id: number;
  name: string;
  brand: string;
  rating: number;
  addedBy?: string;
  isVerified?: boolean;
  slug?: string;
}

interface SimilarFragrancesProps {
  fragrances: SimilarFragrance[];
  currentPerfumeId: number;
  userIsVerified?: boolean;
  onAddClick?: () => void;
}

const SimilarFragrances: React.FC<SimilarFragrancesProps> = ({ 
  fragrances, 
  currentPerfumeId, 
  userIsVerified = false,
  onAddClick
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFragrance, setSelectedFragrance] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);

  const searchResults = [
    { id: 10, name: 'Aventus', brand: 'Creed', rating: 4.6, slug: 'creed-aventus' },
    { id: 11, name: 'Green Irish Tweed', brand: 'Creed', rating: 4.4, slug: 'creed-green-irish-tweed' },
    { id: 12, name: 'Dylan Blue', brand: 'Versace', rating: 4.0, slug: 'versace-dylan-blue' }
  ].filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClick = () => {
    // If user is verified (signed in), show the form
    if (userIsVerified) {
      setShowAddForm(!showAddForm);
    } else {
      // If not signed in, trigger the auth modal via onAddClick
      if (onAddClick) {
        onAddClick();
      }
    }
  };

  const handleAddSimilar = () => {
    if (selectedFragrance) {
      console.log('Adding similar fragrance:', selectedFragrance);
      // TODO: Call API to add similar fragrance
      setShowAddForm(false);
      setSearchQuery('');
      setSelectedFragrance(null);
    }
  };

  const displayedFragrances = showAll ? fragrances : fragrances.slice(0, 5);
  const hasMore = fragrances.length > 5;

  return (
    <div className="glass-card rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          Similar Fragrances
        </h3>
        {/* Always show + button */}
        <button
          onClick={handleAddClick}
          className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Similar
        </button>
      </div>

      {/* Add Form - Only show if user is signed in and form is open */}
      {showAddForm && userIsVerified && (
        <div className="mb-4 p-4 bg-green-50/50 rounded-xl border border-green-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Add Similar Fragrance</h4>
            <button 
              onClick={() => setShowAddForm(false)} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search fragrance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 transition-all"
            />
            
            {searchQuery && (
              <div className="max-h-32 overflow-y-auto space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <div
                      key={result.id}
                      onClick={() => setSelectedFragrance(result)}
                      className={`p-2 rounded-lg cursor-pointer transition-all ${
                        selectedFragrance?.id === result.id ? 'bg-green-100 border border-green-300' : 'hover:bg-green-50 border border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{result.name}</p>
                          <p className="text-sm text-gray-600">{result.brand}</p>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-orange-400 fill-current mr-1" />
                          <span className="text-xs text-gray-600">{result.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">No results found</p>
                )}
              </div>
            )}
            
            {selectedFragrance && (
              <button
                onClick={handleAddSimilar}
                className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white py-2 rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Add "{selectedFragrance.name}"
              </button>
            )}
          </div>
        </div>
      )}

      {/* Similar Fragrances List */}
      <div className="space-y-3">
        {displayedFragrances.length > 0 ? (
          displayedFragrances.map((fragrance) => {
            const perfumeSlug = fragrance.slug || fragrance.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            
            return (
              <Link 
                key={fragrance.id} 
                href={`/perfumes/${perfumeSlug}`}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50/50 transition-colors border border-transparent hover:border-green-200 cursor-pointer group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      {fragrance.name}
                    </h4>
                    {fragrance.isVerified && <Check className="w-4 h-4 text-green-500 ml-2" />}
                  </div>
                  {fragrance.brand && (
                    <p className="text-sm text-gray-600">{fragrance.brand}</p>
                  )}
                  {fragrance.rating > 0 && (
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-orange-400 fill-current" />
                      <span className="ml-1 text-xs text-gray-600">{fragrance.rating}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-4">No similar fragrances yet</p>
        )}
      </div>

      {/* View More/Less Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2 px-4 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              View More ({fragrances.length - 5} more)
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default SimilarFragrances;