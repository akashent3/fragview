'use client';
import { useEffect } from 'react';
import { useAuthModal } from '@/components/auth/AuthModal';
import { Leaf, Flower2 } from 'lucide-react';

export default function SignUpPage() {
  const { open } = useAuthModal();
  useEffect(() => { open({ mode: 'signup', reason: 'Create your FragView account' }); }, [open]);
  
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6" style={{ backgroundColor: '#FAFFF5' }}>
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

      <div className="glass-card rounded-2xl p-8 max-w-md w-full relative z-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Opening sign up…</p>
        </div>
      </div>
    </div>
  );
}