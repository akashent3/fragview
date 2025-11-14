'use client';

import { useState, useEffect } from 'react';
import { Star, Heart, ShoppingBag, Sparkles, Flower2, Droplets, Leaf, Wind, Trees } from 'lucide-react';

export default function ThemePreview() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Track mouse for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const botanicalTheme = {
    name: 'Botanical Garden Enhanced',
    primary: '#E8F3E8',
    secondary: '#D4E4BC',
    accent: '#F2C6A0',
    background: '#FAFFF5',
    text: '#2C3E2C',
    cardBg: 'rgba(255, 255, 255, 0.85)',
    gradient: 'linear-gradient(135deg, #E8F3E8 0%, #F2C6A0 100%)',
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: botanicalTheme.background }}>
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Floating Leaves Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <pattern id="leaves" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M50 30 Q 30 50 50 70 Q 70 50 50 30" fill="#D4E4BC" />
            <path d="M150 80 Q 130 100 150 120 Q 170 100 150 80" fill="#E8F3E8" />
            <circle cx="100" cy="50" r="3" fill="#F2C6A0" />
            <circle cx="30" cy="150" r="2" fill="#D4E4BC" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#leaves)" />
        </svg>

        {/* Animated Floating Icons */}
        <div className="absolute top-10 left-20 animate-float">
          <Leaf size={30} className="text-green-300/50" style={{ transform: `translateX(${mousePosition.x}px)` }} />
        </div>
        <div className="absolute top-40 right-32 animate-float" style={{ animationDelay: '2s' }}>
          <Flower2 size={25} className="text-orange-300/40" style={{ transform: `translateX(${-mousePosition.x}px)` }} />
        </div>
        <div className="absolute bottom-32 left-40 animate-float" style={{ animationDelay: '3s' }}>
          <Trees size={35} className="text-green-400/30" style={{ transform: `translateY(${mousePosition.y}px)` }} />
        </div>
        <div className="absolute top-60 left-1/2 animate-float" style={{ animationDelay: '1s' }}>
          <Wind size={28} className="text-teal-300/40" style={{ transform: `translateX(${mousePosition.x}px)` }} />
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
            🌿 Botanical Garden Theme - Modern Version
          </h1>
          <p className="text-center text-sm opacity-70">Notice the floating elements, glass effects, and animations!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8 relative z-10" style={{ color: botanicalTheme.text }}>
        
        {/* Hero Section with Wave Border */}
        <section className="mb-16 relative">
          <div 
            className="rounded-3xl p-12 text-center shadow-2xl backdrop-blur-sm relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${botanicalTheme.primary}99 0%, ${botanicalTheme.accent}99 100%)`,
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            {/* Inner Decorative Elements */}
            <div className="absolute top-5 right-5 opacity-20">
              <Flower2 size={80} />
            </div>
            <div className="absolute bottom-5 left-5 opacity-20">
              <Leaf size={100} style={{ transform: 'rotate(-30deg)' }} />
            </div>

            <h2 className="text-5xl font-bold mb-4 relative z-10" style={{ fontFamily: 'Playfair Display, serif' }}>
              Discover Nature's Finest Scents
            </h2>
            <p className="text-xl mb-8 opacity-90 relative z-10">
              Where botanical beauty meets luxury fragrance
            </p>
            
            {/* Glassmorphic Buttons */}
            <div className="flex gap-4 justify-center relative z-10">
              <button className="px-8 py-3 rounded-full font-semibold backdrop-blur-md bg-white/60 hover:bg-white/80 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/50">
                Explore Garden
              </button>
              <button className="px-8 py-3 rounded-full font-semibold backdrop-blur-md bg-transparent hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border-2 border-green-700/50">
                View Collection
              </button>
            </div>
          </div>

          {/* Wave SVG Border */}
          <div className="absolute -bottom-1 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="w-full h-12 fill-current text-green-50">
              <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,56C672,48,768,32,864,32C960,32,1056,48,1152,53.3C1248,59,1344,53,1392,50.7L1440,48L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"/>
            </svg>
          </div>
        </section>

        {/* Modern Glass Cards */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold mb-8 flex items-center gap-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Sparkles className="text-orange-400" />
            Featured Botanical Fragrances
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                name: 'Garden Essence', 
                brand: 'Botanical Luxe', 
                price: '$165', 
                rating: 4.8, 
                notes: 'Rose, Jasmine, Sandalwood',
                badge: 'NEW',
                badgeColor: 'bg-green-500'
              },
              { 
                name: 'Forest Dreams', 
                brand: 'Nature\'s Secret', 
                price: '$145', 
                rating: 4.6, 
                notes: 'Pine, Cedar, Moss',
                badge: 'POPULAR',
                badgeColor: 'bg-orange-500'
              },
              { 
                name: 'Citrus Bloom', 
                brand: 'Fresh Fields', 
                price: '$125', 
                rating: 4.7, 
                notes: 'Lemon, Orange Blossom, Mint',
                badge: 'SALE',
                badgeColor: 'bg-red-500'
              },
            ].map((perfume, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:rotate-1"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 228, 188, 0.3)',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
                }}
              >
                {/* Badge */}
                {perfume.badge && (
                  <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-white text-xs font-bold ${perfume.badgeColor}`}>
                    {perfume.badge}
                  </div>
                )}

                {/* Image Section with Overlay */}
                <div className="h-48 relative overflow-hidden bg-gradient-to-br from-green-50 to-orange-50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Droplets size={64} className="text-green-300 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  {/* Decorative Corner Elements */}
                  <div className="absolute top-2 left-2 opacity-30">
                    <Leaf size={30} className="text-green-500" />
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-30">
                    <Flower2 size={30} className="text-orange-400" />
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-xl font-bold mb-1">{perfume.name}</h4>
                  <p className="text-sm opacity-70 mb-3">{perfume.brand}</p>
                  
                  {/* Rating with Animation */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className="transition-all duration-300 hover:scale-125"
                        fill={i < Math.floor(perfume.rating) ? '#F2C6A0' : 'none'}
                        style={{ color: '#F2C6A0' }}
                      />
                    ))}
                    <span className="ml-2 text-sm opacity-70">{perfume.rating}</span>
                  </div>

                  {/* Notes Pills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {perfume.notes.split(', ').map((note, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-green-100/50 text-green-700">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                      {perfume.price}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-full bg-green-100/50 hover:bg-green-200/50 transform hover:scale-110 transition-all duration-200">
                        <Heart size={20} className="text-green-600" />
                      </button>
                      <button className="p-2 rounded-full bg-orange-100/50 hover:bg-orange-200/50 transform hover:scale-110 transition-all duration-200">
                        <ShoppingBag size={20} className="text-orange-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modern Feature Cards with Icons */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
            Experience The Garden
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: Leaf, title: 'Natural', color: 'from-green-400 to-green-600' },
              { icon: Flower2, title: 'Floral', color: 'from-pink-400 to-rose-600' },
              { icon: Wind, title: 'Fresh', color: 'from-blue-400 to-teal-600' },
              { icon: Trees, title: 'Woody', color: 'from-amber-400 to-orange-600' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative p-8 rounded-2xl text-center group cursor-pointer overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                  <item.icon size={32} className="text-white" />
                </div>
                <h4 className="font-semibold text-lg">{item.title}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* Decorative Section Divider */}
        <div className="flex items-center justify-center my-16">
          <div className="flex items-center gap-4">
            <div className="h-px w-32 bg-gradient-to-r from-transparent to-green-300" />
            <Flower2 className="text-orange-400" />
            <div className="h-px w-32 bg-gradient-to-l from-transparent to-green-300" />
          </div>
        </div>

        {/* Stats Section with Animated Numbers */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '109K+', label: 'Perfumes', icon: Droplets },
              { number: '500+', label: 'Brands', icon: Sparkles },
              { number: '50K+', label: 'Reviews', icon: Star },
              { number: '10K+', label: 'Members', icon: Heart },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-2xl group hover:scale-105 transition-all duration-300"
                style={{
                  background: 'rgba(232, 243, 232, 0.5)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(212, 228, 188, 0.3)',
                }}
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-green-600 group-hover:rotate-12 transition-transform duration-300" />
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm opacity-70">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CSS for Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}