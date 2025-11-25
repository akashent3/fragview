'use client';
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import ImageUpload from '@/components/upload/ImageUpload';
import AsyncTagInput from './AsyncTagInput';
import WardrobeSearch from '@/components/wardrobe/WardrobeSearch';
import { updateProfile } from '@/app/actions/profile';

interface Props {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfileModal({ user, onClose, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.name || '',
    location: user.location || '',
    bio: user.bio || '',
    image: user.image || '',
    favNotes: user.favNotes || [],
    favAccords: user.favAccords || [],
    favPerfumers: user.favPerfumers || [],
    favPerfumeIds: user.favPerfumeIds || [], // IDs only
    favPerfumesDisplay: user.favPerfumesDisplay || [] // Full objects for display
  });

  const handleSave = async () => {
    setSaving(true);
    
    await updateProfile({
      displayName: formData.displayName,
      location: formData.location,
      bio: formData.bio,
      image: formData.image, 
      favNotes: formData.favNotes.join(','),
      favAccords: formData.favAccords.join(','),
      favPerfumers: formData.favPerfumers.join(','),
      favPerfumeIds: formData.favPerfumeIds
    });
    
    setSaving(false);
    onSuccess();
  };

  // Handlers for Favorites
  const addPerfume = (p: any) => {
    if (formData.favPerfumeIds.length >= 5) return;
    if (formData.favPerfumeIds.includes(p.id)) return;
    setFormData(prev => ({
      ...prev,
      favPerfumeIds: [...prev.favPerfumeIds, p.id],
      favPerfumesDisplay: [...prev.favPerfumesDisplay, p]
    }));
  };

  const removePerfume = (id: string) => {
    setFormData(prev => ({
      ...prev,
      // ✅ FIX: Explicitly typed 'pid' to string to fix TS7006
      favPerfumeIds: prev.favPerfumeIds.filter((pid: string) => pid !== id),
      favPerfumesDisplay: prev.favPerfumesDisplay.filter((p: any) => p.id !== id)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Profile Picture</label>
                <ImageUpload 
                  onUploadComplete={(url) => setFormData({...formData, image: url})}
                  currentImage={formData.image}
                  folder="avatars"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name</label>
                <input 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                <input 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio</label>
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none h-32 resize-none"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>
            </div>

            {/* Right Column: Favorites */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100">
                <h3 className="font-semibold text-green-800 mb-4">My Signature 5</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {formData.favPerfumesDisplay.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-green-100 shadow-sm">
                      <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden shrink-0">
                        {p.image && <img src={p.image} className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-sm truncate flex-1">{p.name}</span>
                      <button onClick={() => removePerfume(p.id)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                  ))}
                </div>
                {formData.favPerfumeIds.length < 5 && (
                  <WardrobeSearch onSelect={addPerfume} />
                )}
              </div>

              <AsyncTagInput 
                label="Favorite Notes" 
                field="notes" 
                selected={formData.favNotes} 
                onChange={tags => setFormData({...formData, favNotes: tags})} 
              />
              
              <AsyncTagInput 
                label="Favorite Accords" 
                field="accords" 
                selected={formData.favAccords} 
                onChange={tags => setFormData({...formData, favAccords: tags})} 
              />
              
              <AsyncTagInput 
                label="Favorite Perfumers" 
                field="perfumers" 
                selected={formData.favPerfumers} 
                onChange={tags => setFormData({...formData, favPerfumers: tags})} 
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-8 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-70"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Profile</>}
          </button>
        </div>
      </div>
    </div>
  );
}