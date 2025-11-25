'use client';
import React, { useState } from 'react';
import { submitBrandApplication } from '@/app/actions/submissions';
import { Loader2, CheckCircle, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function BrandSubmitPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const res = await submitBrandApplication(formData);
    setLoading(false);
    
    if (res.error) setError(res.error);
    else setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFFF5] p-4 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Application Received!</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          We have received your brand application. Our team will verify your details and contact you at the provided email address within 3-5 business days.
        </p>
        <Link href="/" className="text-orange-600 font-bold hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFFF5] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/submit" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8 lg:p-10">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Brand Owner Application</h1>
              <p className="text-sm text-gray-500">Verify your brand to manage your catalog on FragView.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Brand Info */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Brand Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Brand Name *</label>
                  <input required name="brandName" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Parent Company (if any)</label>
                  <input name="companyName" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Country of Origin</label>
                  <input required name="country" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Official Website</label>
                  <input required type="url" name="website" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Representative Contact</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Contact Name *</label>
                  <input required name="contactName" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Title / Position</label>
                  <input name="position" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Business Email *</label>
                  <input required type="email" name="contactEmail" placeholder="name@brand.com" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" name="contactPhone" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>
            </section>

            {/* Verification */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Verification</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Proof of Ownership (Link)</label>
                <input name="verificationLink" placeholder="Link to LinkedIn profile, press kit, or business registration" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                <p className="text-xs text-gray-500 mt-1">We strictly verify all brand applications. Using a company email domain helps speed up the process.</p>
              </div>
            </section>

            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}