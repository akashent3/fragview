'use client';
import React from 'react';
import { Clock, Droplets, Thermometer, Calendar, User, DollarSign } from 'lucide-react';

interface PerfumeInfoProps {
  perfume: {
    description: string;
    longevity: number;
    sillage: number;
    season: string[];
    occasions: string[];
    year: number;
    perfumer: string;
    price: string;
    concentration: string;
  };
}

const PerfumeInfo: React.FC<PerfumeInfoProps> = ({ perfume }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
        About This Fragrance
      </h3>
      
      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-300">
        {perfume.description}
      </p>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        
        {/* Performance Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 transition-colors duration-300">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Longevity</span>
          </div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{perfume.longevity}/5</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800 transition-colors duration-300">
          <div className="flex items-center mb-2">
            <Droplets className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Sillage</span>
          </div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{perfume.sillage}/5</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200 dark:border-green-800 transition-colors duration-300">
          <div className="flex items-center mb-2">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">Price Range</span>
          </div>
          <div className="text-sm font-bold text-green-600 dark:text-green-400">{perfume.price}</div>
        </div>

      </div>

      {/* Additional Details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        
        <div>
          <div className="flex items-center mb-2">
            <Thermometer className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Best Seasons</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {perfume.season.map((s, index) => (
              <span key={index} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs transition-colors duration-300">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Perfect For</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {perfume.occasions.map((occasion, index) => (
              <span key={index} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-xs transition-colors duration-300">
                {occasion}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Perfumer</span>
          </div>
          <span className="text-gray-900 dark:text-white font-medium transition-colors duration-300">{perfume.perfumer}</span>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <span className="w-4 h-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded mr-2"></span>
            <span className="font-medium text-gray-700 dark:text-gray-300">Concentration</span>
          </div>
          <span className="text-gray-900 dark:text-white font-medium transition-colors duration-300">{perfume.concentration}</span>
        </div>
      </div>
    </div>
  );
};

export default PerfumeInfo;