'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Package, Building2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Submission {
  id: string;
  type: 'PERFUME' | 'BRAND';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  data: any;
  createdAt: Date;
  user: {
    username: string;
    email: string;
  };
}

interface Props {
  submissions: Submission[];
}

export default function SubmissionsList({ submissions }: Props) {
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [typeFilter, setTypeFilter] = useState<'all' | 'PERFUME' | 'BRAND'>('all');

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter !== 'all' && sub.status !== filter) return false;
    if (typeFilter !== 'all' && sub. type !== typeFilter) return false;
    return true;
  });

  const statusCounts = {
    PENDING: submissions.filter((s) => s.status === 'PENDING').length,
    APPROVED: submissions.filter((s) => s.status === 'APPROVED').length,
    REJECTED: submissions.filter((s) => s.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1. 5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'PENDING'
                    ?  'bg-orange-500 text-white'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Pending ({statusCounts.PENDING})
              </button>
              <button
                onClick={() => setFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'APPROVED'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Approved ({statusCounts. APPROVED})
              </button>
              <button
                onClick={() => setFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'REJECTED'
                    ? 'bg-red-500 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <XCircle className="w-4 h-4 inline mr-1" />
                Rejected ({statusCounts. REJECTED})
              </button>
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('PERFUME')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === 'PERFUME'
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Package className="w-4 h-4 inline mr-1" />
                Perfumes
              </button>
              <button
                onClick={() => setTypeFilter('BRAND')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === 'BRAND'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <Building2 className="w-4 h-4 inline mr-1" />
                Brands
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No submissions found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions. map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {submission.type === 'PERFUME' ?  (
                          <Package className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Building2 className="w-5 h-5 text-blue-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {submission.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.data. name || submission.data.brandName}
                        </p>
                        {submission.type === 'PERFUME' && submission.data.brand && (
                          <p className="text-sm text-gray-500">by {submission.data.brand}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.user.username}
                        </p>
                        <p className="text-xs text-gray-500">{submission.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          submission.status === 'PENDING'
                            ?  'bg-orange-100 text-orange-800'
                            : submission.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/submissions/${submission.id}`}
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}