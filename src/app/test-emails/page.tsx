'use client';

import { useState } from 'react';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';

export default function TestEmailsPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async (type: string) => {
    if (!email || !email.includes('@')) {
      setResult({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/test/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, email }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult({ 
          type: 'success', 
          message: `✅ ${data.message || 'Email sent successfully! '}` 
        });
      } else {
        setResult({ 
          type: 'error', 
          message: `❌ Error: ${data.error || 'Failed to send email'}` 
        });
      }
    } catch (error: any) {
      setResult({ 
        type: 'error', 
        message: `❌ Network error: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFFF5] to-[#F0FDF4] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-orange-400 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                Test Email Templates
              </h1>
              <p className="text-sm text-gray-600">Send test emails to verify templates</p>
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email Address:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Result Message */}
          {result && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              result.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {result.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0 mt-0. 5" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <p className="text-sm leading-relaxed">{result.message}</p>
            </div>
          )}
        </div>

        {/* Email Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Email Templates</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => sendTestEmail('welcome')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🎉'}
              Send Welcome Email
            </button>
            
            <button
              onClick={() => sendTestEmail('verification')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '✉️'}
              Send Verification Email
            </button>
            
            <button
              onClick={() => sendTestEmail('password-reset')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🔒'}
              Send Password Reset Email
            </button>
            
            <button
              onClick={() => sendTestEmail('weekly-digest')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '📬'}
              Send Weekly Digest Email
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-yellow-900 mb-2">⚠️ Important Notes:</h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Emails will be sent to your actual email address</li>
            <li>Make sure <code className="bg-yellow-100 px-1 rounded">RESEND_API_KEY</code> is configured in . env</li>
            <li>Check your spam folder if emails don't arrive</li>
            <li>Logo will only show if your site is deployed with absolute URLs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}