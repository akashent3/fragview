'use client';
import React, { useState } from 'react';
import { Plus, X, Star, Check, Sparkles } from 'lucide-react';

interface SimilarFragrance {
  id: number;
  name: string;
  brand: string;
  rating: number;
  addedBy?: string;
  isVerified?: boolean;
}

interface SimilarFragrancesProps {
  fragrances: SimilarFragrance[];
  currentPerfumeId: number;
  userIsVerified?: boolean;
}

const SimilarFragrances: React.FC<SimilarFragrancesProps> = ({ 
  fragrances, 
  currentPerfumeId, 
  userIsVerified = false 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFragrance, setSelectedFragrance] = useState<any>(null);

  // Mock search results
  const searchResults = [
    { id: 10, name: 'Aventus', brand: 'Creed', rating: 4.6 },
    { id: 11, name: 'Green Irish Tweed', brand: 'Creed', rating: 4.4 },
    { id: 12, name: 'Dylan Blue', brand: 'Versace', rating: 4.0 }
  ].filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSimilar = () => {
    if (selectedFragrance) {
      console.log('Adding similar fragrance:', selectedFragrance);
      setShowAddForm(false);
      setSearchQuery('');
      setSelectedFragrance(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          Similar Fragrances
        </h3>
        {userIsVerified && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Similar
          </button>
        )}
      </div>

      {/* Add Similar Form - BOTANICAL THEME */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-green-50/50 rounded-xl border border-green-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Add Similar Fragrance</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search for fragrance to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80"
            />
            
            {searchQuery && (
              <div className="max-h-32 overflow-y-auto">
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    onClick={() => setSelectedFragrance(result)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedFragrance?.id === result.id
                        ? 'bg-green-100'
                        : 'hover:bg-green-50'
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
                ))}
              </div>
            )}
            
            {selectedFragrance && (
              <button
                onClick={handleAddSimilar}
                className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white py-2 rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Add "{selectedFragrance.name}" as Similar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Similar Fragrances List - BOTANICAL THEME */}
      <div className="space-y-4">
        {fragrances.map((fragrance) => (
          <div key={fragrance.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50/50 cursor-pointer transition-colors border border-transparent hover:border-green-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-orange-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="font-medium text-gray-900">{fragrance.name}</h4>
                {fragrance.isVerified && (
                  <Check className="w-4 h-4 text-green-500 ml-2" aria-label="Verified by community" />
                )}
              </div>
              <p className="text-sm text-gray-600">{fragrance.brand}</p>
              <div className="flex items-center mt-1">
                <Star className="w-3 h-3 text-orange-400 fill-current" />
                <span className="ml-1 text-xs text-gray-600">{fragrance.rating}</span>
                {fragrance.addedBy && (
                  <span className="text-xs text-gray-500 ml-2">
                    Added by {fragrance.addedBy}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarFragrances;