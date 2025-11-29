'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Building2, AlertCircle, CheckCircle, Clock, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnrichmentItem {
  _id: string;
  name: string;
  brand?: string;
  logo?: string;
  image?: string;
  missingFields: string[];
  enrichmentStatus: string;
  addedBy: string;
  createdAt: Date;
}

interface Props {
  perfumes: EnrichmentItem[];
  brands: EnrichmentItem[];
}

export default function EnrichmentDashboard({ perfumes, brands }: Props) {
  const [activeTab, setActiveTab] = useState<'perfumes' | 'brands'>('perfumes');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress'>('pending');

  const currentItems = activeTab === 'perfumes' ? perfumes : brands;
  
  const filteredItems = currentItems.filter(item => {
    if (statusFilter === 'all') return true;
    return item.enrichmentStatus === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMissingFieldBadge = (field: string) => {
    const labels: Record<string, string> = {
      image: '📷 Image',
      logo: '🏢 Logo',
      description: '📝 Description',
      top_notes: '🌸 Top Notes',
      middle_notes: '🌺 Middle Notes',
      base_notes: '🌲 Base Notes',
      accords: '🎨 Accords',
      perfumer: '👤 Perfumer',
      founded_year: '📅 Founded Year',
      website: '🌐 Website',
    };
    return labels[field] || field;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('perfumes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'perfumes'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Perfumes ({perfumes.length})
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'brands'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Brands ({brands.length})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1. 5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems. length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium text-gray-900">All caught up!</p>
            <p className="text-sm text-gray-500 mt-1">
              No {activeTab} need enrichment at this time.
            </p>
          </div>
        ) : (
          filteredItems. map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Image/Logo */}
                {item.image || item.logo ? (
                  <img
                    src={item.image || item.logo}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {activeTab === 'perfumes' ?  (
                      <Package className="w-8 h-8 text-gray-400" />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.name}
                  </h3>
                  {item.brand && (
                    <p className="text-sm text-gray-500 truncate">{item.brand}</p>
                  )}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(item.enrichmentStatus)}`}>
                    {item.enrichmentStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {item.enrichmentStatus === 'in_progress' && <Edit className="w-3 h-3 mr-1" />}
                    {item.enrichmentStatus}
                  </span>
                </div>
              </div>

              {/* Missing Fields */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Missing Fields:</p>
                <div className="flex flex-wrap gap-1">
                  {item.missingFields.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">None</span>
                  ) : (
                    item. missingFields.map((field) => (
                      <span
                        key={field}
                        className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md"
                      >
                        {getMissingFieldBadge(field)}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-xs text-gray-500">
                  Added {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
                <p className="text-xs text-gray-500">
                  Source: <span className="font-medium">{item.addedBy}</span>
                </p>
              </div>

              {/* Actions */}
              <Link
                href={`/admin/enrichment/${activeTab}/${item._id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Enrich Now
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}