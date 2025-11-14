import { Settings, Globe, Bell, Shield, Palette, Leaf, Flower2 } from 'lucide-react';

export const metadata = { title: "Settings • Fragview" };

export default function SettingsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
      {/* Animated Background Elements - ADDED */}
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
        {/* Header - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Settings size={100} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent relative z-10">
            Settings
          </h1>
          <p className="text-gray-600 mt-2 relative z-10">Manage your FragView preferences</p>
        </div>

        {/* Notifications Section - BOTANICAL THEME */}
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
                  defaultChecked 
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
                  defaultChecked 
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

        {/* Privacy Section - BOTANICAL THEME */}
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
              <div className="flex-1">
                <div className="font-medium text-gray-800">Profile Visibility</div>
                <div className="text-sm text-gray-600">Make your profile visible to other users</div>
              </div>
              <button className="bg-green-500 relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-gray-800">Show Wardrobe</div>
                <div className="text-sm text-gray-600">Let others see your fragrance collection</div>
              </div>
              <button className="bg-gray-300 relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-gray-800">Activity Status</div>
                <div className="text-sm text-gray-600">Show when you're online</div>
              </div>
              <button className="bg-gray-300 relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
              </button>
            </div>
          </div>
        </section>

        {/* Appearance Section - BOTANICAL THEME */}
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
          <button className="px-6 py-2 rounded-lg border border-green-200 text-gray-700 hover:bg-green-50 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-orange-500 text-white font-medium hover:shadow-lg transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}