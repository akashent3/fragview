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
    <div className="glass-card rounded-2xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        About This Fragrance
      </h3>
      
      {/* Description */}
      <p className="text-gray-700 leading-relaxed mb-6">
        {perfume.description}
      </p>

      {/* Quick Info Grid - BOTANICAL COLORS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        
        {/* Performance Stats */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">Longevity</span>
          </div>
          <div className="text-lg font-bold text-green-600">{perfume.longevity}/5</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center mb-2">
            <Droplets className="w-4 h-4 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-orange-800">Sillage</span>
          </div>
          <div className="text-lg font-bold text-orange-600">{perfume.sillage}/5</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center mb-2">
            <DollarSign className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">Price Range</span>
          </div>
          <div className="text-sm font-bold text-green-600">{perfume.price}</div>
        </div>

      </div>

      {/* Additional Details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        
        <div>
          <div className="flex items-center mb-2">
            <Thermometer className="w-4 h-4 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">Best Seasons</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {perfume.season.map((s, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Calendar className="w-4 h-4 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">Perfect For</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {perfume.occasions.map((occasion, index) => (
              <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                {occasion}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <User className="w-4 h-4 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">Perfumer</span>
          </div>
          <span className="text-gray-800 font-medium">{perfume.perfumer}</span>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <span className="w-4 h-4 bg-gradient-to-r from-green-500 to-orange-500 rounded mr-2"></span>
            <span className="font-medium text-gray-700">Concentration</span>
          </div>
          <span className="text-gray-800 font-medium">{perfume.concentration}</span>
        </div>
      </div>
    </div>
  );
};

export default PerfumeInfo;