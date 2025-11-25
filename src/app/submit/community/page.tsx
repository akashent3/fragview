'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/components/auth/AuthModal';
import { submitCommunitySuggestion } from '@/app/actions/submissions';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CommunitySubmitPage() {
  const { data: session, status } = useSession();
  const { open } = useAuthModal();
  
  const [type, setType] = useState<'PERFUME' | 'BRAND'>('PERFUME');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>;

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFFF5] p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        <p className="text-gray-600 mb-6">You need to be a member to submit suggestions.</p>
        <button onClick={() => open({ mode: 'signin', reason: 'Sign in to submit suggestions' })} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold">
          Sign In
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      type,
      name: formData.get('name') as string,
      brand: formData.get('brand') as string, // only for perfume
      notes: formData.get('notes') as string,
      link: formData.get('link') as string,
    };

    const res = await submitCommunitySuggestion(data);
    setLoading(false);
    
    if (res.error) setError(res.error);
    else setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFFF5] p-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Suggestion Received!</h2>
        <p className="text-gray-600 mb-8">Thank you for helping improve FragView. Our admins will review your submission shortly.</p>
        <Link href="/submit" className="text-green-600 font-bold hover:underline">Submit another</Link>
        <Link href="/" className="mt-4 text-gray-500 text-sm hover:text-gray-800">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFFF5] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/submit" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Suggest a Missing Item</h1>
          
          {/* Type Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setType('PERFUME')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'PERFUME' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Missing Perfume
            </button>
            <button 
              onClick={() => setType('BRAND')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'BRAND' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Missing Brand
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {type === 'PERFUME' ? 'Perfume Name' : 'Brand Name'} <span className="text-red-500">*</span>
              </label>
              <input required name="name" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>

            {type === 'PERFUME' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Brand Name <span className="text-red-500">*</span></label>
                <input required name="brand" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Reference Link <span className="text-red-500">*</span></label>
              <input required type="url" name="link" placeholder="Official website, press release..." className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
              <p className="text-xs text-gray-500 mt-1">Helping us verify the information faster.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes</label>
              <textarea name="notes" rows={3} placeholder="Any details about notes, year, or perfumer..." className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Submit Suggestion'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}