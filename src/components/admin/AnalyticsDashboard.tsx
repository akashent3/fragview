'use client';

import { TrendingUp, Users, Star, Package, Eye } from 'lucide-react';

interface AnalyticsData {
  userGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  topReviewers: Array<{
    username: string;
    reviewCount: number;
    xp: number;
  }>;
  topPerfumes: Array<{
    name: string;
    brandName: string;
    reviewCount: number;
    avgRating: number;
  }>;
  systemHealth: {
    dbSize: string;
    totalStorage: string;
    avgResponseTime: string;
  };
}

interface Props {
  data: AnalyticsData;
}

export default function AnalyticsDashboard({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* User Growth */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          User Growth
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Daily New Users</p>
            <p className="text-3xl font-bold text-gray-900">{data.userGrowth.daily}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Weekly New Users</p>
            <p className="text-3xl font-bold text-gray-900">{data. userGrowth.weekly}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Monthly New Users</p>
            <p className="text-3xl font-bold text-gray-900">{data.userGrowth.monthly}</p>
          </div>
        </div>
      </div>

      {/* Top Reviewers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Top Reviewers
        </h2>
        <div className="space-y-3">
          {data.topReviewers.map((reviewer, index) => (
            <div key={reviewer.username} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                <div>
                  <p className="font-medium text-gray-900">{reviewer.username}</p>
                  <p className="text-sm text-gray-500">{reviewer.xp} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-gray-900">{reviewer.reviewCount} reviews</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Perfumes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          Most Reviewed Perfumes
        </h2>
        <div className="space-y-3">
          {data.topPerfumes.map((perfume, index) => (
            <div key={perfume.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                <div>
                  <p className="font-medium text-gray-900">{perfume.name}</p>
                  <p className="text-sm text-gray-500">{perfume.brandName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{perfume.reviewCount} reviews</p>
                  <p className="text-xs text-gray-500">★ {perfume.avgRating. toFixed(1)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-600" />
          System Health
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Database Size</p>
            <p className="text-2xl font-bold text-gray-900">{data.systemHealth. dbSize}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Storage</p>
            <p className="text-2xl font-bold text-gray-900">{data.systemHealth. totalStorage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
            <p className="text-2xl font-bold text-gray-900">{data.systemHealth.avgResponseTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}