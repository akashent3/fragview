// src/app/admin/summaries/page.tsx
'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function AdminSummariesPage() {
  const [perfumeId, setPerfumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRefresh = async () => {
    if (!perfumeId. trim()) {
      setMessage({ type: 'error', text: 'Please enter a perfume ID' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/refresh-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfumeId: perfumeId.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Summary refreshed successfully!' });
        setPerfumeId(''); // Clear input
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to refresh summary' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">AI Review Summaries</h1>
          </div>
          <p className="text-gray-600">Manage AI-generated review summaries for perfumes</p>
        </div>

        {/* Manual Refresh Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-purple-200 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-purple-600" />
            Refresh Summary Manually
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Perfume ID (MongoDB _id)
              </label>
              <input
                type="text"
                value={perfumeId}
                onChange={(e) => setPerfumeId(e.target.value)}
                placeholder="Enter perfume ID (e.g., 689edbbabdff1d03261e0053)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                You can find the perfume ID in the database or URL
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading || !perfumeId.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ?  (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Refresh Summary
                </>
              )}
            </button>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-xl flex items-start gap-3 ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</span>
              <span>AI analyzes all reviews for a perfume using Llama 3.2</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</span>
              <span>Generates summary, common likes/dislikes, and sentiment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</span>
              <span>Auto-refreshes if summary is 30+ days old or 5+ new reviews</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">4</span>
              <span>Requires minimum 5 reviews to generate a summary</span>
            </li>
          </ul>

          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Make sure Ollama is running on your PC before refreshing summaries. 
              Use the monthly batch script for bulk processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}