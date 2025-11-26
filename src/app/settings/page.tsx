'use client';
import { useState, useEffect } from 'react';
import { Settings, Globe, Bell, Shield, Palette, Leaf, Flower2, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [settings, setSettings] = useState({
    priceAlerts: true,
    reviewResponses: true,
    newsletter: false,
    isWardrobePublic: false,
    isActivityPublic: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router. push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          priceAlerts: data.priceAlerts ??  true,
          reviewResponses: data.reviewResponses ?? true,
          newsletter: data.newsletter ??  false,
          isWardrobePublic: data.isWardrobePublic ?? false,
          isActivityPublic: data.isActivityPublic ?? true,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response. ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save settings.  Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFFF5]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
        
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 p-6 relative z-10">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Settings size={100} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent relative z-10">
            Settings
          </h1>
          <p className="text-gray-600 mt-2 relative z-10">Manage your FragView preferences</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`glass-card rounded-xl p-4 ${message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Notifications Section */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-orange-400 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
              <p className="text-sm text-gray-600">Manage your notification preferences</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-3">
                <input 
                  id="alerts" 
                  type="checkbox" 
                  checked={settings. priceAlerts}
                  onChange={(e) => setSettings({ ...settings, priceAlerts: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                />
                <label htmlFor="alerts" className="cursor-pointer">
                  <div className="font-medium text-gray-800">Price & Stock Alerts</div>
                  <div className="text-sm text-gray-600">Get notified about price drops and restocks</div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-3">
                <input 
                  id="reviews" 
                  type="checkbox" 
                  checked={settings.reviewResponses}
                  onChange={(e) => setSettings({ ...settings, reviewResponses: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                />
                <label htmlFor="reviews" className="cursor-pointer">
                  <div className="font-medium text-gray-800">Review Responses</div>
                  <div className="text-sm text-gray-600">Notifications when someone responds to your reviews</div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-3">
                <input 
                  id="newsletter" 
                  type="checkbox" 
                  checked={settings.newsletter}
                  onChange={(e) => setSettings({ ...settings, newsletter: e. target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                />
                <label htmlFor="newsletter" className="cursor-pointer">
                  <div className="font-medium text-gray-800">Newsletter</div>
                  <div className="text-sm text-gray-600">Weekly fragrance news and recommendations</div>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-orange-400 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Privacy</h2>
              <p className="text-sm text-gray-600">Control your privacy settings</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-3">
                <input 
                  id="publicWardrobe" 
                  type="checkbox"
                  checked={settings.isWardrobePublic}
                  onChange={(e) => setSettings({ ...settings, isWardrobePublic: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                />
                <label htmlFor="publicWardrobe" className="cursor-pointer">
                  <div className="font-medium text-gray-800">Public Wardrobe</div>
                  <div className="text-sm text-gray-600">Allow others to see your fragrance collection</div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-3">
                <input 
                  id="publicActivity" 
                  type="checkbox"
                  checked={settings.isActivityPublic}
                  onChange={(e) => setSettings({ ...settings, isActivityPublic: e. target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                />
                <label htmlFor="publicActivity" className="cursor-pointer">
                  <div className="font-medium text-gray-800">Public Activity</div>
                  <div className="text-sm text-gray-600">Show your reviews and activity on your public profile</div>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-orange-400 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Appearance</h2>
              <p className="text-sm text-gray-600">Customize how FragView looks</p>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Leaf className="w-4 h-4" />
              <span className="font-medium">Botanical Garden Theme Active</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Enjoy the natural, botanical-inspired interface
            </p>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button 
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg border border-green-200 text-gray-700 hover:bg-green-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-orange-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}